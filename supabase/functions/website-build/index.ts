/* ═══════════════════════════════════════════════════════════════
   AlphaTekx — AI Website Builder Edge Function v5
   Provider chain:
     1. Gemini 2.5 Flash  (3 retries, exp backoff)
     2. Gemini 2.0 Flash  (3 retries, exp backoff)
     3. Gemini 1.5 Flash  (3 retries, highest TPM)
     4. OpenAI GPT-4o     (if OPENAI_API_KEY set)
     5. Anthropic Claude  (if ANTHROPIC_API_KEY set)
     6. Groq llama-3.3-70b (if GROQ_API_KEY set)
     7. Groq llama-3.1-8b  (if GROQ_API_KEY set)
═══════════════════════════════════════════════════════════════ */

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GEMINI_BASE = "https://app-cgqteick6nep-api-VaOwP8E7dJqa.gateway.appmedo.com/v1beta/models";
// Three Gemini model tiers — tried in order before third-party providers
const GEMINI_MODELS = [
  "gemini-2.5-flash",    // primary — 32k tokens, best quality
  "gemini-2.0-flash",    // fallback — faster, lower quota pressure
  "gemini-1.5-flash",    // last-resort — highest TPM ceiling
];

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(resolve, ms);
    signal?.addEventListener("abort", () => { clearTimeout(t); reject(new Error("Aborted")); }, { once: true });
  });
}

/* ── Read Gemini SSE stream ───────────────────────────────────── */
async function readGeminiStream(res: Response, signal: AbortSignal): Promise<string> {
  if (!res.body) throw new Error("No response body from Gemini");
  const reader = res.body.getReader();
  const dec = new TextDecoder("utf-8");
  let buf = "", out = "";
  signal.addEventListener("abort", () => reader.cancel(), { once: true });
  while (true) {
    if (signal.aborted) throw new Error("Request timed out — please try again.");
    const { done, value } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    const lines = buf.split("\n");
    buf = lines.pop() ?? "";
    for (const line of lines) {
      if (!line.startsWith("data:")) continue;
      const chunk = line.slice(5).trim();
      if (!chunk || chunk === "[DONE]") continue;
      try {
        const frame = JSON.parse(chunk);
        const text = frame?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) out += text;
      } catch { /* partial frame */ }
    }
  }
  return out.trim();
}

/* ── 1. Gemini — tries 2.5-flash → 2.0-flash → 1.5-flash ───────── */
async function callGemini(apiKey: string, prompt: string, signal: AbortSignal): Promise<string> {
  const body = JSON.stringify({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: { maxOutputTokens: 32768, temperature: 0.75, topP: 0.92 },
  });
  const headers = {
    "Content-Type": "application/json",
    "X-Gateway-Authorization": `Bearer ${apiKey}`,
  };
  const DELAYS = [4000, 9000, 18000]; // exponential backoff per attempt
  let lastErr = "";

  for (const model of GEMINI_MODELS) {
    const url = `${GEMINI_BASE}/${model}:streamGenerateContent?alt=sse`;
    for (let attempt = 0; attempt <= DELAYS.length; attempt++) {
      if (signal.aborted) throw new Error("Aborted");
      try {
        const res = await fetch(url, { method: "POST", signal, headers, body });
        if (res.status === 429 || res.status === 503) {
          lastErr = `${model} ${res.status} (attempt ${attempt + 1})`;
          console.warn(`[website-build] ${lastErr}`);
          if (attempt < DELAYS.length) { await sleep(DELAYS[attempt], signal); continue; }
          break; // exhausted retries for this model → try next model
        }
        if (!res.ok) {
          const b = await res.text();
          throw new Error(`${model} ${res.status}: ${b.slice(0, 200)}`);
        }
        const out = await readGeminiStream(res, signal);
        if (out.length > 2000) {
          console.log(`[website-build] ${model} succeeded — ${out.length} chars`);
          return out;
        }
        lastErr = `${model}: output too short (${out.length} chars)`;
        break; // try next model
      } catch (e) {
        const msg = (e as Error).message;
        if (msg === "Aborted") throw e;
        lastErr = msg;
        if (attempt < DELAYS.length && (msg.includes("429") || msg.includes("503") || msg.includes("rate"))) {
          await sleep(DELAYS[attempt], signal); continue;
        }
        break; // non-retryable error → try next model
      }
    }
    console.warn(`[website-build] ${model} exhausted, trying next Gemini model`);
  }
  throw new Error(`All Gemini models rate-limited. Last: ${lastErr}`);
}

/* ── 2. OpenAI GPT-4o ───────────────────────────────────────── */
async function callOpenAI(prompt: string, signal: AbortSignal): Promise<string> {
  const key = Deno.env.get("OPENAI_API_KEY");
  if (!key) throw new Error("OPENAI_API_KEY not configured");
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST", signal,
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${key}` },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 16384,
      temperature: 0.72,
    }),
  });
  if (!res.ok) {
    const b = await res.text();
    throw new Error(`OpenAI ${res.status}: ${b.slice(0, 200)}`);
  }
  const data = await res.json();
  return (data.choices?.[0]?.message?.content || "").trim();
}

/* ── 3. Anthropic Claude-3.5 Haiku ─────────────────────────── */
async function callAnthropic(prompt: string, signal: AbortSignal): Promise<string> {
  const key = Deno.env.get("ANTHROPIC_API_KEY");
  if (!key) throw new Error("ANTHROPIC_API_KEY not configured");
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST", signal,
    headers: {
      "Content-Type": "application/json",
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-3-5-haiku-20241022",
      max_tokens: 16384,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!res.ok) {
    const b = await res.text();
    throw new Error(`Anthropic ${res.status}: ${b.slice(0, 200)}`);
  }
  const data = await res.json();
  return (data.content?.[0]?.text || "").trim();
}

/* ── 4. Groq llama-3.3-70b-versatile (capped at 12k tokens) ─── */
async function callGroq70b(prompt: string, signal: AbortSignal): Promise<string> {
  const key = Deno.env.get("GROQ_API_KEY");
  if (!key) throw new Error("GROQ_API_KEY not configured");
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST", signal,
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${key}` },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 12000, // TPM-safe: 12k instead of 32k avoids rate limits
      temperature: 0.72,
    }),
  });
  if (!res.ok) {
    const b = await res.text();
    throw new Error(`Groq-70b ${res.status}: ${b.slice(0, 200)}`);
  }
  const data = await res.json();
  return (data.choices?.[0]?.message?.content || "").trim();
}

/* ── 5. Groq llama-3.1-8b-instant (highest TPM, last resort) ── */
async function callGroq8b(prompt: string, signal: AbortSignal): Promise<string> {
  const key = Deno.env.get("GROQ_API_KEY");
  if (!key) throw new Error("GROQ_API_KEY not configured");
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST", signal,
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${key}` },
    body: JSON.stringify({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 12000,
      temperature: 0.72,
    }),
  });
  if (!res.ok) {
    const b = await res.text();
    throw new Error(`Groq-8b ${res.status}: ${b.slice(0, 200)}`);
  }
  const data = await res.json();
  return (data.choices?.[0]?.message?.content || "").trim();
}

/* ── Master builder: full 5-provider chain ──────────────────── */
// Simplified builder for surgical cleanup: use single primary provider (Gemini) with clear failures.
async function buildWithFallback(apiKey: string, prompt: string, signal: AbortSignal): Promise<string> {
  try {
    console.log(`[website-build] Using primary provider: Gemini (gemini-2.5-flash)`);
    const out = await callGemini(apiKey, prompt, signal);
    if (out.length < 2000) throw new Error('Provider returned insufficient content');
    return out;
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error('[website-build] Primary provider failed:', msg);
    throw new Error(`Primary AI provider failed: ${msg}`);
  }
}

/* ── Detect if request is a functional APP vs a marketing WEBSITE ── */
function isAppRequest(subject: string): boolean {
  const s = subject.toLowerCase();
  // Explicit app/tool/game keywords
  if (/\bapp\b|\btool\b|\bgame\b|\bgames\b|\bcalculator\b|\btracker\b|\bcounter\b|\bmanager\b|\bdashboard\b|\bplanner\b|\bscheduler\b|\bbudget\b|\bexpense\b|\btimer\b|\bstopwatch\b|\bclock\b|\bquiz\b|\bsurvey\b|\bchat\b|\bboard\b|\bnote\b|\btodo\b|\bto-do\b|\btask\b/.test(s)) return true;
  // Functional verbs
  if (/track\b|manage\b|log\b|count\b|calcul|convert\b|measure\b|monitor\b|record\b|analyz/.test(s)) return true;
  // Specific app domains
  if (/calorie|nutrition|fitness tracker|workout log|habit|flash card|flashcard|vocabulary|typing|drawing|paint|chess|sudoku|pomodoro|invoice|recipe\b|expense|budget|finance tracker|crypto|stock ticker|weather app|news feed/.test(s)) return true;
  return false;
}

/* ── Detect website category from subject ────────────────────── */
function detectCategory(subject: string): string {
  const s = subject.toLowerCase();
  if (/restaurant|cafe|bakery|food|bistro|pizza|sushi|coffee|bar|grill|diner|catering/.test(s)) return "restaurant";
  if (/portfolio|photographer|photography|designer|artist|creative|freelance/.test(s)) return "portfolio";
  if (/gym|fitness|workout|yoga|pilates|health|wellness|sport|athlete/.test(s)) return "fitness";
  if (/legal|law|attorney|lawyer|firm|counsel/.test(s)) return "legal";
  if (/fashion|luxury|jewel|boutique|brand|couture/.test(s)) return "luxury";
  if (/game|gaming|esport|crypto|blockchain|web3/.test(s)) return "gaming";
  if (/school|educat|learn|course|tutor|academ/.test(s)) return "education";
  if (/shop|store|ecommerce|product|sell|retail/.test(s)) return "ecommerce";
  if (/agency|studio|consult|marketing|branding/.test(s)) return "agency";
  if (/real estate|property|realty|housing|mortgage/.test(s)) return "realestate";
  if (/hospital|clinic|medical|doctor|dental|therapy/.test(s)) return "medical";
  return "saas";
}

/* ── Production-Grade prompt ─────────────────────────────────── */
function buildPrompt(subject: string, styleRef = ""): string {
  return isAppRequest(subject)
    ? buildAppPrompt(subject, styleRef)
    : buildWebsitePrompt(subject, styleRef);
}

/* ══════════════════════════════════════════════════════════════
   APP PROMPT — generates a real, interactive, self-contained web app
══════════════════════════════════════════════════════════════ */
function buildAppPrompt(subject: string, styleRef = ""): string {
  return `You are an expert web developer. Build a COMPLETE, FULLY FUNCTIONAL single-page web application for: "${subject}"
${styleRef ? `Visual style: ${styleRef}` : "Use a sleek dark UI — deep navy/black background, vibrant gradient accents, glassmorphism cards."}

════════════════════════════════════════════════════════════════════
CRITICAL RULES — READ EVERY WORD
════════════════════════════════════════════════════════════════════
1. Output ONE single complete HTML file — <!DOCTYPE html> to </html>. Nothing else.
2. ALL CSS must be inside <style> tags. ALL JavaScript inside <script> tags. Zero external CDN dependencies.
3. The app MUST be fully working — every button, input, calculation, and interaction must function correctly.
4. ALL data must persist to localStorage — the app must survive page refreshes.
5. Build a REAL APP, not a landing page. No hero sections, no testimonials, no pricing tables.
6. Use vanilla HTML/CSS/JS only — no React, no Vue, no libraries. Pure DOM manipulation.
7. The UI must be polished, beautiful, and feel like a real commercial app.
8. Every section must be fully implemented. No placeholder text like "coming soon" or "TODO".
9. Output MUST be at minimum 4000 characters. If you are running short, add MORE features.
10. The entire file must be 100% complete — never truncate or cut off at the end.

════════════════════════════════════════════════════════════════════
DESIGN SYSTEM — APPLY EXACTLY
════════════════════════════════════════════════════════════════════
CSS variables (always in :root):
  --bg: #070714;
  --surface: rgba(255,255,255,0.04);
  --surface2: rgba(255,255,255,0.07);
  --border: rgba(255,255,255,0.09);
  --primary: #7c3aed;
  --primary-glow: rgba(124,58,237,0.35);
  --accent: #06b6d4;
  --text: #f0f0ff;
  --muted: rgba(200,210,255,0.45);
  --success: #22c55e;
  --error: #ef4444;
  --warning: #f59e0b;
  --radius: 14px;

Base styles:
* { box-sizing: border-box; margin: 0; padding: 0; }
body { background: var(--bg); color: var(--text); font-family: 'Segoe UI', system-ui, sans-serif; min-height: 100vh; }

Cards/panels:
.card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 20px; }
.card:hover { border-color: rgba(124,58,237,0.3); }

Inputs:
input, textarea, select {
  background: var(--surface2); border: 1.5px solid var(--border); border-radius: 10px;
  color: var(--text); padding: 10px 14px; font-size: 14px; width: 100%; outline: none;
  transition: border-color 0.2s;
}
input:focus, textarea:focus, select:focus { border-color: var(--primary); box-shadow: 0 0 0 3px var(--primary-glow); }

Buttons:
.btn { padding: 10px 20px; border-radius: 10px; border: none; cursor: pointer; font-size: 14px; font-weight: 600; transition: all 0.2s; }
.btn-primary { background: linear-gradient(135deg,#7c3aed,#2563eb); color: #fff; }
.btn-primary:hover { filter: brightness(1.12); transform: translateY(-1px); box-shadow: 0 4px 20px var(--primary-glow); }
.btn-secondary { background: var(--surface2); color: var(--text); border: 1px solid var(--border); }
.btn-danger { background: rgba(239,68,68,0.12); color: #f87171; border: 1px solid rgba(239,68,68,0.25); }

════════════════════════════════════════════════════════════════════
APP ARCHITECTURE — IMPLEMENT ALL OF THESE
════════════════════════════════════════════════════════════════════

HEADER / NAV BAR:
• Fixed top bar: app icon (emoji or SVG) + app name (gradient text) + tagline
• Right side: summary stats relevant to the app (e.g. total calories today, tasks done, budget left)
• Background: rgba(7,7,20,0.95) with backdrop-filter:blur(20px); bottom border: 1px solid var(--border)

MAIN LAYOUT:
• Max-width: 900px, centered, padding: 20px
• Responsive: single column on mobile, multi-column on desktop where appropriate

DATA INPUT PANEL:
• Card with a clear form for adding/creating the primary data entity
• Smart inputs: appropriate types (number, text, date, select, range)
• Inline validation with red border + error message below field
• Submit button: full-width, .btn-primary, shows loading state briefly
• On success: shake/pulse animation, clear form, show success toast

DATA DISPLAY / LIST:
• Live-updating list/grid of all items
• Each item: card with relevant data, edit button, delete button (with confirm)
• Empty state: centered icon + helpful message + CTA button
• Items sorted by most recent first (or most relevant)
• Smooth CSS transition when items are added/removed (opacity + transform)

STATISTICS / DASHBOARD PANEL:
• 2–4 stat cards in a grid: key metrics computed from the data
• Each stat card: large number + label + trend indicator (↑↓ icon)
• Stats update in real-time as data changes

CHARTS / VISUALIZATION (pure CSS/SVG — no Chart.js):
• Implement at least ONE visual: progress bar, bar chart (div widths), donut ring (SVG stroke-dashoffset), or sparkline
• Labels, values, and percentage must be accurate

SETTINGS / PREFERENCES (collapsible panel or modal):
• At minimum: goal/target setting, unit preference, reset data option
• Settings persist to localStorage

TOAST NOTIFICATION SYSTEM:
• Fixed bottom-right corner, z-index:9999
• showToast(message, type='success'|'error'|'warning') function
• Auto-dismiss after 3s with slide-in/out animation
• Queue multiple toasts

KEYBOARD SHORTCUTS:
• Enter to submit the main form
• Escape to close any open modal
• Add a visible keyboard shortcut hint in the form

LOCAL STORAGE SCHEMA (implement completely):
const STORAGE_KEY = 'atx_${subject.toLowerCase().replace(/[^a-z0-9]/g,"_")}';
function save(data) { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }
function load() { try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null') || getDefaultState(); } catch { return getDefaultState(); } }

════════════════════════════════════════════════════════════════════
DOMAIN-SPECIFIC FEATURES — IMPLEMENT FULLY FOR: "${subject}"
════════════════════════════════════════════════════════════════════
Analyse what "${subject}" needs and implement ALL relevant features:
• If calorie/nutrition app: food search (static JSON of 50+ foods), macro breakdown (protein/carbs/fat), daily goal progress ring, meal categorization (breakfast/lunch/dinner/snack), weekly history chart
• If todo/task app: priorities (High/Medium/Low), due dates, categories, completion toggle, drag handles (visual only), filter tabs (All/Active/Done), progress bar
• If budget/expense app: categories, income vs expense, running balance, monthly chart, export to CSV functionality
• If fitness/workout app: exercise library (static), sets/reps/weight logging, personal records, weekly volume chart
• If timer/pomodoro: actual working countdown timer (setInterval), session history, configurable durations, notification sound (Web Audio API)
• If calculator: full keyboard support, history log, scientific functions if relevant
• If quiz/flashcard: card flip animation (CSS transform rotateY), score tracking, spaced repetition basics
• For ANY other app: implement the 3 most important features fully and completely

════════════════════════════════════════════════════════════════════
POLISH REQUIREMENTS
════════════════════════════════════════════════════════════════════
• Smooth transitions: all interactive elements have transition: all 0.2s ease
• Hover effects: cards lift slightly (transform: translateY(-2px)), buttons glow
• Loading skeleton: shown briefly when app first loads (200ms)
• Gradient text for the app title: background: linear-gradient(135deg,#7c3aed,#06b6d4); -webkit-background-clip:text; -webkit-text-fill-color:transparent
• Scrollbar: thin, styled with var(--border) color
• Number animations: when stats update, briefly flash the number with a color pulse
• Mobile: fully responsive, touch-friendly (48px min tap targets), no horizontal scroll

════════════════════════════════════════════════════════════════════
SELF-CHECK BEFORE OUTPUTTING
════════════════════════════════════════════════════════════════════
✓ Does every button DO something when clicked? If any is non-functional → fix it.
✓ Does the app load with sample/demo data to show what it looks like? If empty → add 3 sample entries.
✓ Does localStorage save AND load correctly? Verify the load() function is called on DOMContentLoaded.
✓ Do all calculations produce correct results? Check the math.
✓ Is the file complete — does it end with </html>? If not → complete it.
✓ Is the output at least 4000 characters? If not → add more features.
✓ Are there ANY external CDN links? If yes → remove them, inline everything.

Output the complete HTML file now. Start with <!DOCTYPE html> and end with </html>. Do NOT truncate.`;
}

/* ── Website / landing-page prompt ──────────────────────────── */
function buildWebsitePrompt(subject: string, styleRef = ""): string {
  /* ── Theme registry: 3-token palette (bg / primary / accent) ── */
  const themes: Record<string, {
    bg: string; primary: string; accent: string;
    textLight: string; textDark: string; font: string; isDark: boolean;
  }> = {
    saas:       { bg:"#050510", primary:"#7c3aed", accent:"#06b6d4",  textLight:"#f0f0ff", textDark:"rgba(220,220,255,0.6)", font:"Space Grotesk",      isDark:true  },
    restaurant: { bg:"#140a04", primary:"#e07b39", accent:"#c9a84c",  textLight:"#fdf4ec", textDark:"rgba(253,244,236,0.6)", font:"Playfair Display",   isDark:true  },
    portfolio:  { bg:"#faf9f7", primary:"#c0392b", accent:"#8e44ad",  textLight:"#1a1a2a", textDark:"rgba(26,26,42,0.6)",   font:"DM Sans",            isDark:false },
    fitness:    { bg:"#07090b", primary:"#00e676", accent:"#ff3d00",  textLight:"#f0fff4", textDark:"rgba(240,255,244,0.6)", font:"Barlow Condensed",   isDark:true  },
    legal:      { bg:"#08101c", primary:"#d4af37", accent:"#1e3a5f",  textLight:"#f5f0e8", textDark:"rgba(245,240,232,0.6)", font:"Source Sans 3",      isDark:true  },
    luxury:     { bg:"#0c0c0c", primary:"#c9a84c", accent:"#e8d5b7",  textLight:"#f9f4ec", textDark:"rgba(249,244,236,0.6)", font:"Cormorant Garamond", isDark:true  },
    gaming:     { bg:"#060410", primary:"#00f0ff", accent:"#8b00ff",  textLight:"#e0f8ff", textDark:"rgba(224,248,255,0.6)", font:"Rajdhani",           isDark:true  },
    education:  { bg:"#f6f9ff", primary:"#2563eb", accent:"#7c3aed",  textLight:"#1a2050", textDark:"rgba(26,32,80,0.6)",   font:"Inter",              isDark:false },
    ecommerce:  { bg:"#080808", primary:"#f59e0b", accent:"#ef4444",  textLight:"#fffbf0", textDark:"rgba(255,251,240,0.6)", font:"Inter",              isDark:true  },
    agency:     { bg:"#070714", primary:"#6366f1", accent:"#f59e0b",  textLight:"#f0f0ff", textDark:"rgba(240,240,255,0.6)", font:"Space Grotesk",      isDark:true  },
    realestate: { bg:"#f5f0ea", primary:"#1e3a5f", accent:"#c9a84c",  textLight:"#1a1a2a", textDark:"rgba(26,26,42,0.6)",   font:"Lato",               isDark:false },
    medical:    { bg:"#f0f9ff", primary:"#0ea5e9", accent:"#10b981",  textLight:"#0a1628", textDark:"rgba(10,22,40,0.6)",   font:"Inter",              isDark:false },
  };
  const t   = themes[category] ?? themes.saas;
  const txt = t.textLight;
  const muted = t.textDark;
  const cardBg     = t.isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.025)";
  const cardBorder = t.isDark ? "rgba(255,255,255,0.09)" : "rgba(0,0,0,0.07)";
  const glassBg    = t.isDark ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.65)";
  const glassBorder= t.isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.09)";
  const accentRgb  = t.accent.replace("#","").match(/../g)?.map(h=>parseInt(h,16)).join(",") ?? "6,182,212";
  const primaryRgb = t.primary.replace("#","").match(/../g)?.map(h=>parseInt(h,16)).join(",") ?? "124,58,237";

  return `You are AlphaTekx's elite production engineer. You build PROFESSIONAL, CONVERSION-OPTIMISED, POLISHED websites that look like they were built by a world-class agency and cost $25,000. The client wants: "${subject}"

════════════════════════════════════════════════════════════════════
VISUAL STYLE MANDATE — FOLLOW EXACTLY
════════════════════════════════════════════════════════════════════
${styleRef
  ? `The user has explicitly chosen this design style — implement it faithfully:
"${styleRef}"

Override the category-detected theme below ONLY where the user style conflicts. The user style wins.`
  : `Auto-select the most beautiful, appropriate style for "${subject}" from the theme registry below.`
}

════════════════════════════════════════════════════════════════════
ABSOLUTE OUTPUT CONTRACT — ZERO EXCEPTIONS
════════════════════════════════════════════════════════════════════
• Output ONLY raw HTML. Start with <!DOCTYPE html>. End with </html>. Nothing else.
• NO markdown fences (no \`\`\`). NO prose commentary. NO explanations inside or outside.
• ALL CSS in one <style> tag in <head>. ALL JS in one <script> tag before </body>.
• External CDNs allowed: Google Fonts (@import in CSS), GSAP from cdn.jsdelivr.net. Nothing else.
• ZERO lorem ipsum. ZERO placeholder copy. ZERO "Coming Soon". ZERO "TODO". ZERO generic filler.
• Every word of copy must be SPECIFIC, BENEFIT-DRIVEN, and tailored to "${subject}".
• ALL forms must be functional HTML5 with validation. No dead/broken elements.

════════════════════════════════════════════════════════════════════
SEO & META — INJECT EXACTLY THESE TAGS IN <head>
════════════════════════════════════════════════════════════════════
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="description" content="[Write a compelling 150-char SEO description specific to ${subject}]">
<meta property="og:title" content="[Site title specific to ${subject}]">
<meta property="og:description" content="[Same as meta description]">
<meta property="og:type" content="website">
<meta name="theme-color" content="${t.primary}">
<title>[Specific, keyword-rich title for ${subject}]</title>

════════════════════════════════════════════════════════════════════
3-TOKEN DESIGN SYSTEM — USE ONLY THESE COLORS
════════════════════════════════════════════════════════════════════
/* PALETTE: exactly 3 colours. No deviations, no extra hues. */
--color-bg:      ${t.bg};        /* Background — entire page foundation */
--color-primary: ${t.primary};   /* Primary — headings, CTAs, icons */
--color-accent:  ${t.accent};    /* Accent — highlights, badges, hover states */

/* Derived from the 3 core tokens */
--text:         ${txt};
--muted:        ${muted};
--card-bg:      ${cardBg};
--card-border:  ${cardBorder};
--glass-bg:     ${glassBg};
--glass-border: ${glassBorder};
--gradient:     linear-gradient(135deg, var(--color-primary), var(--color-accent));
--gradient-rev: linear-gradient(135deg, var(--color-accent), var(--color-primary));

@import url('https://fonts.googleapis.com/css2?family=${t.font.replace(/ /g,'+')}:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; }
body { font-family: '${t.font}', sans-serif; background: var(--color-bg); color: var(--text); overflow-x: hidden; line-height: 1.6; }

/* Gradient text utility */
.gradient-text { background: var(--gradient); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }

/* SECTION SPACING MANDATE: minimum 80px top+bottom on every section */
section { padding: 100px 0; position: relative; }
.container { max-width: 1200px; margin: 0 auto; padding: 0 clamp(1.25rem, 5vw, 3rem); }

════════════════════════════════════════════════════════════════════
GLASSMORPHISM & CARD SYSTEM — ALL CARDS MUST USE THESE EXACT RULES
════════════════════════════════════════════════════════════════════
/* Base card — NO exceptions, every card uses this */
.card {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 20px;                    /* MINIMUM 12px — use 16–24px */
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  padding: 36px;
  transition: transform 0.35s cubic-bezier(0.23,1,0.32,1), box-shadow 0.35s, border-color 0.35s;
}
.card:hover {
  transform: translateY(-8px);
  box-shadow: 0 24px 60px rgba(${primaryRgb},0.18), 0 0 0 1px rgba(${primaryRgb},0.12);
  border-color: rgba(${primaryRgb},0.25);
}
/* Gradient accent bar on top of every feature card */
.card-accent::before {
  content: '';
  display: block;
  width: 48px; height: 3px;
  background: var(--gradient);
  border-radius: 2px;
  margin-bottom: 20px;
}
/* 3D hover for feature grid */
.card-3d { transform-style: preserve-3d; perspective: 1000px; }
.card-3d:hover { transform: rotateX(-5deg) rotateY(4deg) translateY(-10px) scale(1.02); }

/* Button system */
.btn-primary {
  display: inline-flex; align-items: center; gap: 10px;
  padding: 16px 36px; background: var(--gradient);
  color: #fff; border-radius: 50px;
  font-family: '${t.font}', sans-serif;
  font-weight: 700; font-size: 15px; letter-spacing: -0.01em;
  border: none; cursor: pointer; white-space: nowrap;
  box-shadow: 0 8px 32px rgba(${primaryRgb},0.38);
  transition: transform 0.2s, box-shadow 0.2s;
}
.btn-primary:hover { transform: translateY(-3px) scale(1.03); box-shadow: 0 16px 48px rgba(${primaryRgb},0.52); }
.btn-secondary {
  display: inline-flex; align-items: center; gap: 10px;
  padding: 15px 34px; background: transparent;
  border: 1.5px solid var(--glass-border); border-radius: 50px;
  color: var(--text); font-family: '${t.font}', sans-serif;
  font-weight: 600; font-size: 15px; cursor: pointer;
  transition: border-color 0.2s, color 0.2s, background 0.2s;
}
.btn-secondary:hover { border-color: var(--color-primary); color: var(--color-primary); background: rgba(${primaryRgb},0.06); }

════════════════════════════════════════════════════════════════════
MANDATORY ANIMATIONS — ALL MUST BE PRESENT
════════════════════════════════════════════════════════════════════
1. THREE ambient gradient orbs (position:fixed, pointer-events:none, z-index:0):
   .orb { position:fixed; border-radius:50%; filter:blur(120px); opacity:${t.isDark?'0.20':'0.10'}; z-index:0; pointer-events:none; animation:orb-drift var(--d,22s) ease-in-out infinite alternate; }
   .orb-1 { width:700px;height:700px; background:var(--color-primary); top:-15%;left:-10%; --d:20s; }
   .orb-2 { width:550px;height:550px; background:var(--color-accent);  bottom:-10%;right:-8%; --d:26s; }
   .orb-3 { width:450px;height:450px; background:var(--color-primary); top:45%;left:45%; --d:32s; }
   @keyframes orb-drift { from{transform:translate(0,0)scale(1)} to{transform:translate(50px,70px)scale(1.18)} }

2. Scroll reveal (.reveal elements):
   .reveal { opacity:0; transform:translateY(48px); transition:opacity 0.72s ease, transform 0.72s cubic-bezier(0.23,1,0.32,1); }
   .reveal.in { opacity:1; transform:none; }
   .reveal:nth-child(2){transition-delay:0.1s}.reveal:nth-child(3){transition-delay:0.2s}.reveal:nth-child(4){transition-delay:0.3s}
   IntersectionObserver triggers .in class.

3. GSAP hero entrance (CDN: cdn.jsdelivr.net/npm/gsap@3/dist/gsap.min.js):
   gsap.from('.hero-badge',{opacity:0,y:-20,duration:0.6,ease:'power3.out'});
   gsap.from('.hero-title',{opacity:0,y:70,duration:1.0,delay:0.15,ease:'power4.out'});
   gsap.from('.hero-sub',  {opacity:0,y:30,duration:0.75,delay:0.45,ease:'power3.out'});
   gsap.from('.hero-ctas', {opacity:0,y:30,duration:0.7,delay:0.65,ease:'power3.out'});
   gsap.from('.hero-visual',{opacity:0,x:70,duration:1.1,delay:0.3,ease:'power3.out'});

4. Animated stat counters: data-target + data-suffix on .stat-num, JS animates 0→value over 2.2s.

5. Sticky nav effect: on scroll>60px add .nav-scrolled → heavier glass background + box-shadow.

6. Mobile hamburger: #burger button toggles #nav-links via max-height CSS transition.

7. Smooth anchor scroll: querySelectorAll('a[href^="#"]') → scrollIntoView({behavior:'smooth'}).

════════════════════════════════════════════════════════════════════
6 MANDATORY PRODUCTION COMPONENTS — ALL REQUIRED, ALL POLISHED
════════════════════════════════════════════════════════════════════

COMPONENT A — STICKY NAVIGATION BAR (id="navbar")
──────────────────────────────────────────────────
• position:fixed; top:0; width:100%; z-index:1000; padding:18px 0
• Default: background transparent; transition to .nav-scrolled glass on scroll>60px
• .nav-scrolled { background:var(--glass-bg); backdrop-filter:blur(24px); border-bottom:1px solid var(--glass-border); box-shadow:0 8px 40px rgba(0,0,0,0.18); }
• Left: Logo (gradient-text font-weight:800 text 1.25rem) + brand mark (SVG icon or styled div)
• Center: 5 navigation anchor links (styled as text, hover accent underline, not buttons)
• Right: ONE .btn-primary CTA ("Get Started" or equivalent) + #burger hamburger (mobile)
• On mobile (<768px): center links collapse to #nav-links, hamburger shows, smooth toggle

COMPONENT B — HIGH-CONVERSION HERO SECTION (min-height:100vh, id="hero")
─────────────────────────────────────────────────────────────────────────
• Two-column grid layout: left=copy+CTAs (60%), right=visual mockup (40%). Single column on mobile.
• Top: hero-badge — pill shape, gradient border, short category label (e.g. "✦ Trusted by 10,000+")
• H1.hero-title: 5.5rem desktop / 2.8rem mobile. MUST use .gradient-text. Real, punchy headline.
• .hero-sub: 18px muted, 2 specific sentences on what you get / why now.
• .hero-ctas: TWO buttons side by side — [.btn-primary "Start Free Trial"] [.btn-secondary "Watch Demo →"]
  → BOTH buttons must be present. MANDATORY dual CTA pattern. No exceptions.
• Right visual: a polished CSS-only mockup card (dashboard snippet, product image simulation, abstract 3D shape).
  Use nested rounded cards + gradient fills + CSS transforms. NO real images needed.
• Section padding: padding-top:160px (hero needs extra for fixed nav); padding-bottom:100px.

COMPONENT C — 3-COLUMN BENEFIT/FEATURE GRID (id="features", padding:100px 0)
───────────────────────────────────────────────────────────────────────────────
• Centered section heading (2.8rem) + subheading (1.1rem muted, max-width:600px, centered)
• Grid: 3 columns on desktop, 1 column on mobile. Gap: 24px.
• EXACTLY 6 .card.card-accent.card-3d.reveal cards (3 per row, 2 rows). Each contains:
  — Unique inline SVG icon (32×32, colored var(--color-primary)), NO emoji icons.
  — Feature name: font-weight:700, font-size:1.15rem, margin-top:16px
  — 2 specific benefit sentences: font-size:0.95rem, color:var(--muted), margin-top:8px
  — Gradient accent bar (via card-accent::before pseudo-element)
• QUALITY GUARDRAIL: If any card looks generic, use more specific copy and a more detailed SVG icon.

COMPONENT D — SOCIAL PROOF / TESTIMONIALS (id="testimonials", padding:100px 0)
────────────────────────────────────────────────────────────────────────────────
• Section heading + "What our customers say" subheading
• 3-column grid (1 column on mobile) of .card.reveal testimonial cards. Each:
  — ★★★★★ in var(--color-primary) color, font-size:1.1rem
  — Bold pull-quote in quotation marks, 2 specific sentences (must name a real-world outcome)
  — Divider line
  — Avatar circle: 48px, gradient background, white initials (font-weight:700)
  — Full name (bold, 1rem), title + company (muted, 0.875rem)
• TRUST STRIP above testimonials: 5 company logos simulated as styled text in muted color,
  separated by vertical dividers: "Company A | Company B | Company C | Company D | Company E"

COMPONENT E — FUNCTIONAL LEAD CAPTURE FORM (id="contact", padding:100px 0)
────────────────────────────────────────────────────────────────────────────
• Full-width section with gradient background overlay for visual contrast.
• Centered heading: "Ready to get started?" or context-appropriate variant
• Single large .card form with the following fields (HTML5 validation required):
  — Name input (required, minlength:2, placeholder:"Your full name")
  — Email input (required, type:email, placeholder:"you@company.com")
  — Message/need textarea (required, rows:4, placeholder specific to the business)
  — [Optional] Phone input (type:tel, pattern for basic validation)
  — Submit .btn-primary button (full width, font-size:16px)
• DATA CAPTURE: On submit, JS must:
  1. Validate all required fields. Show inline error messages if invalid.
  2. Serialize form data to JSON.
  3. Save to localStorage under key "atx_leads" as an array of {name,email,message,phone,timestamp}.
  4. Show an animated success state (checkmark + "Thank you! We'll be in touch within 24 hours.").
  5. Log submission to console: console.log('[AlphaTekx Lead]', data).
• Form inputs style: full-width, padding:14px 18px, border-radius:12px, glass background,
  border:1.5px solid var(--glass-border), color:var(--text), font-size:1rem.
  On focus: border-color:var(--color-primary), box-shadow:0 0 0 3px rgba(${primaryRgb},0.12).

COMPONENT F — MULTI-COLUMN FOOTER (id="footer")
────────────────────────────────────────────────
• Background: slightly lighter/darker than page bg. Top border: 1px solid var(--glass-border).
• Padding: 80px 0 40px.
• 4-column grid on desktop, 2-column on tablet, 1-column on mobile:
  — Col 1 (wider): Logo + brand tagline (muted, 2 lines). Social icons (SVG, 4 icons: LinkedIn, Twitter/X, Instagram, GitHub) each 40px circle glass button with hover lift.
  — Col 2: "Product" links (5 anchors specific to the business)
  — Col 3: "Company" links (5 anchors: About, Blog, Careers, Press, Partners)
  — Col 4: "Connect" — email address, phone, address (business-specific placeholder), newsletter mini form (email input + subscribe btn)
• Bottom bar (border-top, margin-top:60px, padding-top:24px):
  — Left: "© 2025 [Brand]. All rights reserved."
  — Right: "Privacy Policy · Terms of Service · Cookie Policy" (muted text links)

════════════════════════════════════════════════════════════════════
MOBILE-FIRST RESPONSIVE MANDATE
════════════════════════════════════════════════════════════════════
Default CSS = mobile layout. Scale up at @media(min-width:768px) and @media(min-width:1024px).
• Hero: flex-direction:column on mobile, grid on desktop.
• Feature grid: grid-cols 1 → 2 → 3.
• Testimonial grid: grid-cols 1 → 3.
• Footer: grid-cols 1 → 2 → 4.
• section padding: 60px 0 on mobile, 100px 0 on desktop.
• Font sizes: hero H1 2.8rem → 5.5rem. Section headings 1.8rem → 2.8rem.
• Container max-width: 100% with 20px padding on mobile.
• NEVER use fixed pixel widths on mobile. Use %, clamp(), or max-width only.

════════════════════════════════════════════════════════════════════
ADDITIONAL SECTIONS — INCLUDE ALL OF THESE (minimum 10 sections total)
════════════════════════════════════════════════════════════════════
• HOW IT WORKS (id="how-it-works", 3-step process, numbered circles, connecting line, .reveal)
• STATS BAR (id="stats", 4 animated counters, gradient bg strip, .stat-num data-target data-suffix)
• SHOWCASE / PORTFOLIO (id="showcase", 3×2 grid of .card.reveal items with subject-specific content)
• PRICING (id="pricing", 3-tier cards: Starter / Pro / Enterprise with feature checklists and CTAs)
• FAQ ACCORDION (id="faq", 8 questions specific to "${subject}", smooth CSS max-height toggle animation)
• TEAM SECTION (id="team", 4 team member cards with avatar circles, name, title, bio, gradient-ring hover)
• BLOG PREVIEW (id="blog", 3 article preview cards with category badge, title, excerpt, "Read More" link)
• NEWSLETTER CTA STRIP (id="newsletter", full-width gradient bg strip, email input + CTA button)

════════════════════════════════════════════════════════════════════
QUALITY GUARDRAILS — SELF-REVIEW BEFORE OUTPUTTING
════════════════════════════════════════════════════════════════════
Before finalising, internally check:
✓ Does the hero headline feel unique and compelling for "${subject}"? If generic → rewrite.
✓ Are ALL 6 feature cards using specific, benefit-driven copy? If not → improve.
✓ Does the form actually save data (localStorage schema)? If not → add the JS.
✓ Are sections separated by at least 100px padding? If any section feels cramped → increase.
✓ Does the glassmorphism look "matured"? (blur, subtle borders, card shadows). If flat → enhance.
✓ Is every card border-radius at least 16px? If any radius < 16px → fix.
✓ Do both hero CTA buttons exist? If only one → add the second.
✓ Is the footer multi-column with all 4 sections? If missing → add.
✓ Does the FAQ accordion have at least 8 specific questions? If not → add more.
✓ Are there at least 10 distinct sections (nav, hero, features, how-it-works, stats, showcase, pricing, faq, team, testimonials, contact, footer)? Count them.

Write the complete, production-ready file now. Do NOT truncate. Output the ENTIRE HTML from <!DOCTYPE html> to </html>. Every section listed above MUST be present and complete.`;
}

/* ── Extract clean HTML ──────────────────────────────────────── */
function extractHTML(raw: string): string {
  let html = raw.trim();
  if (html.startsWith("```html")) html = html.slice(7);
  else if (html.startsWith("```")) html = html.slice(3);
  if (html.endsWith("```")) html = html.slice(0, -3);
  html = html.trim();
  const idx = html.toLowerCase().indexOf("<!doctype");
  if (idx > 0) html = html.slice(idx);
  return html;
}

/* ══════════════════════════════════════════════════════════════
   Main handler
══════════════════════════════════════════════════════════════ */
Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });
  if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405, headers: CORS });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400, headers: { ...CORS, "Content-Type": "application/json" },
    });
  }

  const subject = String(body.subject || body.prompt || "").trim();
  const styleRef = String(body.styleRef || "").trim();
  if (!subject) {
    return new Response(JSON.stringify({ error: "Missing subject/prompt" }), {
      status: 400, headers: { ...CORS, "Content-Type": "application/json" },
    });
  }

  const apiKey = Deno.env.get("INTEGRATIONS_API_KEY");
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "Server config error" }), {
      status: 500, headers: { ...CORS, "Content-Type": "application/json" },
    });
  }

  // Hard 130s abort — safely under Supabase's 150s idle timeout
  const abort = new AbortController();
  const timeoutId = setTimeout(() => abort.abort(), 130_000);

  console.log(`[website-build] Building: "${subject}" style: "${styleRef || 'auto'}"`);

  try {
    const raw  = await buildWithFallback(apiKey, buildPrompt(subject, styleRef), abort.signal);
    const html = extractHTML(raw);

    if (!html.toLowerCase().includes("<!doctype") || !html.toLowerCase().includes("<html")) {
      throw new Error("Gemini returned incomplete HTML. Please try again.");
    }

    console.log(`[website-build] Done — ${html.length} chars`);
    return new Response(JSON.stringify({ html, subject }), {
      status: 200, headers: { ...CORS, "Content-Type": "application/json" },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[website-build] Error:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...CORS, "Content-Type": "application/json" },
    });
  } finally {
    clearTimeout(timeoutId);
  }
});
