/* ═══════════════════════════════════════════════════════════════
   AlphaTekx OS — Agentic Chat Edge Function v10
   Primary  : Gemini 2.5 Flash (platform gateway)
   Fallback1: OpenAI GPT-4o-mini  (OPENAI_API_KEY)
   Fallback2: Anthropic Claude-3-Haiku (ANTHROPIC_API_KEY)
   Fallback3: Groq Llama-3.1-8b-instant (GROQ_API_KEY)
   Search   : Keyword routing + Tavily 5-key chain
   Social   : YouTube API + Tavily site: search
   Clarify  : Always asks 1 question before creating anything
═══════════════════════════════════════════════════════════════ */

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GEMINI_URL =
  "https://app-cgqteick6nep-api-VaOwP8E7dJqa.gateway.appmedo.com/v1beta/models/gemini-2.5-flash:streamGenerateContent?alt=sse";

/* ── Credit costs (must match frontend TOOL_COSTS) ─────────── */
const CREDIT_COSTS: Record<string, number> = {
  image:     15,
  thumbnail: 12,
  website:   10,
  video:     20,
};

/* ── Tavily 5-key fallback chain ───────────────────────────── */
const TAVILY_KEYS = [
  Deno.env.get("TAVILY_API_KEY_1"),
  Deno.env.get("TAVILY_API_KEY_2"),
  Deno.env.get("TAVILY_API_KEY_3"),
  Deno.env.get("TAVILY_API_KEY_4"),
  Deno.env.get("TAVILY_API_KEY_5"),
].filter(Boolean) as string[];

/* ── YouTube API ────────────────────────────────────────────── */
const YT_KEY = Deno.env.get("YOUTUBE_API_KEY") || "AIzaSyAmIbxqGffM8mtU8ncvd1hgHJBFRebPlVc";

interface YTVideo {
  videoId: string; title: string; channel: string; thumbnail: string; description: string;
}

interface SocialPost {
  platform: "tiktok" | "instagram" | "twitter" | "linkedin" | "youtube";
  title: string; url: string; snippet: string; thumbnail?: string; author?: string;
}

/* ═══════════════════════════════════════════════════════════════
   INTENT DETECTION
═══════════════════════════════════════════════════════════════ */

function detectYouTubeIntent(msg: string): string | null {
  const PATTERNS = [
    /^search\s+(?:on\s+)?youtube\s+(?:for\s+)?(.+)/i,
    /^youtube\s+search\s+(?:for\s+)?(.+)/i,
    /^find\s+(?:me\s+)?(?:on\s+)?youtube\s+(.+)/i,
    /^(?:show|play|watch)\s+(?:on\s+)?youtube\s+(.+)/i,
    /(?:show|play|watch)\s+(.+?)\s+on\s+youtube$/i,
    /search\s+(?:for\s+)?(.+?)\s+on\s+youtube/i,
    /find\s+(.+?)\s+on\s+youtube/i,
    /youtube\s+video[s]?\s+(?:about|on|for)\s+(.+)/i,
  ];
  for (const p of PATTERNS) {
    const m = msg.match(p);
    if (m?.[1]?.trim().length > 2) return m[1].trim();
  }
  return null;
}

type SocialPlatform = "tiktok" | "instagram" | "twitter" | "linkedin";
interface SocialSearchIntent { platform: SocialPlatform; query: string; }

function detectSocialSearchIntent(msg: string): SocialSearchIntent | null {
  const lower = msg.toLowerCase();
  const PLATFORMS: { id: SocialPlatform; names: string[]; }[] = [
    { id: "tiktok",    names: ["tiktok", "tik tok"] },
    { id: "instagram", names: ["instagram", "ig", "insta"] },
    { id: "twitter",   names: ["twitter", "x.com"] },
    { id: "linkedin",  names: ["linkedin", "linked in"] },
  ];
  const VERBS   = ["search", "find", "look up", "show", "get", "browse", "fetch", "pull"];
  const CONTENT = ["video", "videos", "post", "posts", "content", "clip", "clips", "reel", "reels", "tweet", "tweets"];

  for (const { id, names } of PLATFORMS) {
    for (const name of names) {
      if (!lower.includes(name)) continue;
      const patterns = [
        new RegExp(`(?:${VERBS.join("|")})\\s+(?:on\\s+)?${name}\\s+(?:for\\s+)?(.+)`, "i"),
        new RegExp(`(?:${VERBS.join("|")})\\s+(?:me\\s+)?(.+?)\\s+(?:on|from|in)\\s+${name}`, "i"),
        new RegExp(`${name}\\s+(?:${CONTENT.join("|")})\\s+(?:about|of|on|for)\\s+(.+)`, "i"),
      ];
      for (const p of patterns) {
        const m = msg.match(p);
        const q = m?.[1]?.trim();
        if (q && q.length > 2) return { platform: id, query: q };
      }
    }
  }
  return null;
}

type CreationType = "image" | "thumbnail" | "website" | "video";

function detectCreationIntent(msg: string): CreationType | null {
  const lower = msg.toLowerCase();
  // Image
  if (/(?:generate|create|make|draw|illustrate|paint|render|produce)\s+(?:me\s+)?(?:an?\s+)?(?:image|picture|photo|illustration|artwork|drawing|painting)/i.test(msg)) return "image";
  if (/(?:draw|illustrate|paint)\s+.{3,}/i.test(msg) && !lower.includes("thumbnail") && !lower.includes("website") && !lower.includes("video")) return "image";
  // Thumbnail
  if (/(?:generate|create|make|design|build)\s+(?:me\s+)?(?:a\s+)?(?:youtube\s+)?thumbnail/i.test(msg)) return "thumbnail";
  if (/thumbnail\s+(?:for|about|of|generator)/i.test(lower)) return "thumbnail";
  // Website
  if (/(?:build|create|make|design|generate|develop)\s+(?:me\s+)?(?:a\s+|an\s+)?(?:website|web\s+site|web\s+page|webpage|landing\s+page|site)/i.test(msg)) return "website";
  if (/(?:website|landing\s+page)\s+(?:for|about|on)/i.test(lower)) return "website";
  // Video
  if (/(?:create|make|generate|produce|render)\s+(?:a\s+|an\s+)?(?:short\s+)?(?:ai\s+)?video/i.test(msg)) return "video";
  return null;
}

function extractSubject(msg: string, type: CreationType): string {
  const patterns: Record<CreationType, RegExp[]> = {
    image: [
      /(?:generate|create|make|draw|illustrate|paint|render|produce)\s+(?:me\s+)?(?:an?\s+)?(?:image|picture|photo|illustration|artwork)\s+(?:of|showing|depicting|with|about)?\s*(.+)/i,
      /(?:draw|illustrate|paint)\s+(.+)/i,
    ],
    thumbnail: [
      /(?:generate|create|make|design|build)\s+(?:me\s+)?(?:a\s+)?(?:youtube\s+)?thumbnail\s+(?:for|about|of)?\s*(.+)/i,
      /thumbnail\s+(?:for|about|of)\s+(.+)/i,
    ],
    website: [
      /(?:build|create|make|design|generate|develop)\s+(?:me\s+)?(?:a\s+|an\s+)?(?:website|web\s+site|webpage|landing\s+page|site)\s+(?:for\s+|about\s+|on\s+)?(.+)/i,
      /(?:build|create|make|design|generate|develop)\s+(?:a\s+|an\s+)?(.+?)\s+(?:website|web\s+site|webpage|landing\s+page|site)/i,
    ],
    video: [
      /(?:create|make|generate|produce|render)\s+(?:a\s+|an\s+)?(?:short\s+)?(?:ai\s+)?video\s+(?:of|about|showing|featuring|depicting)\s+(.+)/i,
    ],
  };
  for (const p of (patterns[type] || [])) {
    const m = msg.match(p);
    if (m?.[1]?.trim().length > 2) return m[1].trim();
  }
  return "";
}

/* ── Keyword router ─────────────────────────────────────────── */
const SEARCH_TRIGGERS = [
  "latest","recent","today","tonight","this week","this month","right now","current",
  "news","breaking","update","what happened","who won","score","result","live",
  "price","cost","how much","stock","crypto","bitcoin","ethereum","dollar",
  "weather","forecast","temperature","rain","sunny",
  "2024","2025","2026","released","launched","announced",
  "search","look up","find","research","browse","google",
  "trending","viral","popular right now",
];
function needsWebSearch(msg: string): boolean {
  const lower = msg.toLowerCase();
  return SEARCH_TRIGGERS.some(t => lower.includes(t));
}

/* ═══════════════════════════════════════════════════════════════
   SEARCH IMPLEMENTATIONS
═══════════════════════════════════════════════════════════════ */

async function tavilySearch(query: string, siteFilter?: string): Promise<string> {
  const searchQuery = siteFilter ? `site:${siteFilter} ${query}` : query;
  for (const key of TAVILY_KEYS) {
    try {
      const res = await fetch("https://api.tavily.com/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ api_key: key, query: searchQuery, search_depth: "advanced", include_answer: true, max_results: 8 }),
      });
      if (!res.ok) continue;
      const data = await res.json();
      const answer  = (data.answer || "").trim();
      const sources = ((data.results || []) as { title: string; url: string; content: string }[])
        .slice(0, 6).map(r => `**[${r.title}](${r.url})**\n${(r.content ?? "").slice(0, 350)}`).join("\n\n");
      return [answer, sources].filter(Boolean).join("\n\n---\n\n");
    } catch { /* try next */ }
  }
  return "";
}

async function tavilySearchStructured(query: string, siteFilter: string): Promise<SocialPost[]> {
  for (const key of TAVILY_KEYS) {
    try {
      const res = await fetch("https://api.tavily.com/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ api_key: key, query: `site:${siteFilter} ${query}`, search_depth: "basic", include_answer: false, max_results: 6, include_images: true }),
      });
      if (!res.ok) continue;
      const data = await res.json();
      const platformId = siteFilter.replace(".com","") as SocialPost["platform"];
      return ((data.results || []) as { title: string; url: string; content: string; image?: string }[])
        .filter(r => r.url.includes(siteFilter)).slice(0, 6)
        .map(r => ({ platform: platformId, title: r.title || query, url: r.url, snippet: (r.content || "").slice(0, 200), thumbnail: r.image }));
    } catch { /* try next */ }
  }
  return [];
}

async function searchYouTube(query: string): Promise<YTVideo[]> {
  try {
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=4&key=${YT_KEY}`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    return ((data.items || []) as { id: { videoId: string }; snippet: { title: string; channelTitle: string; thumbnails: { high: { url: string } }; description: string } }[])
      .map(item => ({
        videoId: item.id.videoId,
        title:   item.snippet.title,
        channel: item.snippet.channelTitle,
        thumbnail: item.snippet.thumbnails?.high?.url || "",
        description: (item.snippet.description || "").slice(0, 200),
      }));
  } catch { return []; }
}

/* ═══════════════════════════════════════════════════════════════
   AI PROVIDERS
═══════════════════════════════════════════════════════════════ */
interface GeminiContent { role: string; parts: ({ text: string } | { inline_data: { mime_type: string; data: string } })[]; }

async function callGemini(apiKey: string, contents: GeminiContent[]): Promise<string> {
  const res = await fetch(GEMINI_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
    body: JSON.stringify({ contents, generationConfig: { maxOutputTokens: 3072, temperature: 0.85 } }),
  });
  if (!res.ok) throw new Error(`Gemini HTTP ${res.status}`);
  const text = await res.text();
  const chunks = text.split("\n").filter(l => l.startsWith("data: ") && !l.includes("[DONE]"))
    .map(l => { try { return JSON.parse(l.slice(6)); } catch { return null; } }).filter(Boolean);
  return chunks.flatMap((c: { candidates?: { content?: { parts?: { text?: string }[] } }[] }) =>
    c?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text || "") ?? []).join("");
}

async function callOpenAI(contents: GeminiContent[]): Promise<string> {
  const key = Deno.env.get("OPENAI_API_KEY");
  if (!key) throw new Error("No OpenAI key");
  const messages = contents.map(c => ({
    role: c.role === "model" ? "assistant" : c.role,
    content: c.parts.map(p => "text" in p ? p.text : "[image]").join(" "),
  }));
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${key}` },
    body: JSON.stringify({ model: "gpt-4o-mini", messages, max_tokens: 2048, temperature: 0.85 }),
  });
  if (!res.ok) throw new Error(`OpenAI HTTP ${res.status}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content || "";
}

async function callAnthropic(contents: GeminiContent[]): Promise<string> {
  const key = Deno.env.get("ANTHROPIC_API_KEY");
  if (!key) throw new Error("No Anthropic key");
  const msgs = contents.slice(1).filter(m => m.role !== "user" || m.parts.some(p => "text" in p && p.text.trim()));
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
    body: JSON.stringify({
      model: "claude-3-haiku-20240307", max_tokens: 1200,
      system: contents[0]?.role === "user" ? (contents[0].parts[0] as { text: string }).text : "",
      messages: msgs.slice(1).map(m => ({ role: m.role === "model" ? "assistant" : m.role, content: m.parts.map(p => "text" in p ? p.text : "").join(" ") })),
    }),
  });
  if (!res.ok) throw new Error(`Anthropic HTTP ${res.status}`);
  const data = await res.json();
  return data.content?.[0]?.text || "";
}

async function callGroq(contents: GeminiContent[]): Promise<string> {
  const key = Deno.env.get("GROQ_API_KEY");
  if (!key) throw new Error("No Groq key");
  const messages = contents.map(c => ({
    role: c.role === "model" ? "assistant" : c.role,
    content: c.parts.map(p => "text" in p ? p.text : "").join(" "),
  }));
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${key}` },
    body: JSON.stringify({ model: "llama-3.1-8b-instant", messages, max_tokens: 1500, temperature: 0.85 }),
  });
  if (!res.ok) throw new Error(`Groq HTTP ${res.status}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content || "";
}

async function callAIWithFallback(gatewayKey: string, contents: GeminiContent[], hasImage = false): Promise<string> {
  try {
    const reply = await callGemini(gatewayKey, contents);
    if (reply) return reply;
    throw new Error("Empty Gemini response");
  } catch (e) {
    console.warn("Gemini failed:", (e as Error).message);
    if (hasImage) throw e;
    for (const fn of [callOpenAI, callAnthropic, callGroq]) {
      try { const r = await fn(contents); if (r) return r; } catch { /* try next */ }
    }
    throw new Error("All AI providers failed. Please try again.");
  }
}

/* ═══════════════════════════════════════════════════════════════
   SYSTEM PROMPT
═══════════════════════════════════════════════════════════════ */
const SYSTEM = `You are AlphaTekx OS — a cutting-edge, next-generation Agentic AI built for \
students, professionals, and innovators all over the world. You are not just a chatbot — \
you are a full creative and production AI that can directly generate websites, images, videos, \
thumbnails, voiceovers, scripts, and more, right inside the chat. You also function as a \
powerful super search engine that can find real content from YouTube, TikTok, Instagram, \
Twitter/X, LinkedIn and the web in real time.

GREETINGS: When someone says hello, hi, hey, good morning/afternoon/evening, or any greeting, \
respond warmly and naturally. Introduce yourself briefly, mention what you can create and search, \
and ask how you can help today.

WHO CREATED YOU: If anyone asks who built you, made you, or who your creator is, ALWAYS say:
"I was created by **Thompson Daniel** — a visionary engineer and trailblazer, one of the \
greatest minds in tech today. A true pioneer reshaping what AI can do for the world. 🚀✨"

AGENTIC CREATION CAPABILITIES:
• WEBSITES — Triggered when user says build/create/make/design a website/landing page/site
• IMAGES — Triggered when user says generate/create/make an image/picture/illustration/artwork
• VIDEOS — Triggered when user says create/make/generate a video
• THUMBNAILS — Triggered when user says generate/create/design a thumbnail
• YOUTUBE SEARCH — Triggered when user says search YouTube for X, find X on YouTube
• SOCIAL SEARCH — Triggered for: search TikTok/Instagram/Twitter/LinkedIn for X

CAPABILITIES: Deep academic tutoring, real-time web research, code generation, debugging, \
business writing, data analysis, creative writing, image analysis, and any general knowledge.

RESPONSE STYLE: Be warm, smart, and elite — concise, insightful, markdown-formatted. \
Always deliver outstanding value to every person regardless of where they are in the world.`;

/* ═══════════════════════════════════════════════════════════════
   CLARIFYING QUESTION BUILDER
═══════════════════════════════════════════════════════════════ */
const CLARIFY_PROMPTS: Record<CreationType, string> = {
  image:     "What exactly should the image show? Describe the main subject, mood, setting, and any specific style you prefer.",
  thumbnail: "What is the thumbnail for? Tell me the video title/topic, the style you want (bold, reaction, epic, etc.), and any text to include.",
  website:   "What is the website for? Tell me the purpose, target audience, key sections you want, and your preferred style (modern, minimal, dark, etc.).",
  video:     "What should the video show? Describe the main scene, subject, visual style, and mood you want.",
};

const TYPE_LABELS: Record<CreationType, string> = {
  image:     "image",
  thumbnail: "YouTube thumbnail",
  website:   "website",
  video:     "AI video",
};

function buildClarifyingMessage(type: CreationType, partialSubject: string): string {
  const cost  = CREDIT_COSTS[type] || 0;
  const label = TYPE_LABELS[type];
  const q     = CLARIFY_PROMPTS[type];
  const hint  = partialSubject.length > 3 ? ` about **"${partialSubject}"**` : "";
  return `✨ I'd love to create that ${label} for you${hint}!\n\n💬 ${q}\n\n💳 **This will cost ${cost} credits** from your balance. Just answer above and I'll start generating right away!`;
}

/* ═══════════════════════════════════════════════════════════════
   PENDING CREATION DETECTION (from history)
═══════════════════════════════════════════════════════════════ */
function detectPendingCreation(history: { role: string; content: string }[]): CreationType | null {
  // Look for last assistant/model message that was a clarifying prompt
  const reversed = [...history].reverse();
  const lastModel = reversed.find(m => m.role === "assistant" || m.role === "model");
  if (!lastModel) return null;
  const content = lastModel.content;
  // Check if it's one of our clarifying messages (contains our marker pattern)
  if (!content.includes("💳 **This will cost")) return null;
  if (content.includes("image")) return "image";
  if (content.includes("thumbnail") || content.includes("YouTube thumbnail")) return "thumbnail";
  if (content.includes("website")) return "website";
  if (content.includes("video") || content.includes("AI video")) return "video";
  return null;
}

/* ═══════════════════════════════════════════════════════════════
   MAIN HANDLER
═══════════════════════════════════════════════════════════════ */
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });

  const jsonHeaders = { ...CORS, "Content-Type": "application/json" };

  try {
    const body = await req.json().catch(() => ({}));
    const {
      message, system, history = [], imageBase64, imageMime,
    } = body as {
      message?: string;
      system?: string;
      history?: { role: string; content: string }[];
      imageBase64?: string;
      imageMime?: string;
    };

    if (!message?.trim() && !imageBase64) {
      return new Response(JSON.stringify({ error: "No message provided" }), { status: 400, headers: jsonHeaders });
    }

    const safeMsg    = message || "";
    const gatewayKey = Deno.env.get("INTEGRATIONS_API_KEY") || "";

    /* ── YouTube intent ────────────────────────────────────── */
    const ytQuery = detectYouTubeIntent(safeMsg);
    if (ytQuery) {
      const videos = await searchYouTube(ytQuery);
      const reply = videos.length
        ? `Here are **${videos.length} YouTube videos** for **"${ytQuery}"** 🎬`
        : `I searched YouTube for **"${ytQuery}"** but couldn't find results. Try a different query!`;
      return new Response(JSON.stringify({ reply, didSearch: false, searchQuery: "", videos }), { status: 200, headers: jsonHeaders });
    }

    /* ── Social media search intent ─────────────────────────── */
    const socialIntent = detectSocialSearchIntent(safeMsg);
    if (socialIntent) {
      const siteMap: Record<SocialPlatform, string> = {
        tiktok: "tiktok.com", instagram: "instagram.com", twitter: "twitter.com", linkedin: "linkedin.com",
      };
      const site = siteMap[socialIntent.platform];
      const label = socialIntent.platform.charAt(0).toUpperCase() + socialIntent.platform.slice(1);
      const posts = await tavilySearchStructured(socialIntent.query, site);
      const reply = posts.length
        ? `Here are **${posts.length} ${label} results** for **"${socialIntent.query}"** 🔍`
        : `I searched ${label} for **"${socialIntent.query}"** but couldn't find public results.`;
      return new Response(JSON.stringify({
        reply, didSearch: false, searchQuery: "",
        social_posts: posts.length ? posts : undefined,
        social_platform: socialIntent.platform,
      }), { status: 200, headers: jsonHeaders });
    }

    /* ═══════════════════════════════════════════════════════════
       CREATION INTENTS — Always clarify first, then generate
    ═══════════════════════════════════════════════════════════ */

    // Check if user is REPLYING to a clarifying question (pending creation from history)
    const pendingType = detectPendingCreation(history);

    if (pendingType) {
      // User replied to clarification — now generate with their reply as subject
      const subject = safeMsg.trim();
      let reply = "";
      let toolCall: Record<string, string> | undefined;

      if (pendingType === "image") {
        reply = `🎨 **Generating your image now!** Creating **"${subject}"** with Flux Pro — watch below!`;
        toolCall = { type: "image", prompt: subject, subject };
      } else if (pendingType === "thumbnail") {
        reply = `🖼️ **Creating your YouTube thumbnail!** Designing for **"${subject}"** — ready in seconds!`;
        toolCall = { type: "thumbnail", prompt: subject, subject };
      } else if (pendingType === "website") {
        reply = `🌐 **Building your website now!** Crafting a stunning **"${subject}"** site — watch below!`;
        toolCall = { type: "website", prompt: subject, subject };
      } else if (pendingType === "video") {
        reply = `🎬 **Creating your video now!** Generating a cinematic clip of **"${subject}"** — watch below.`;
        toolCall = { type: "video", prompt: `Cinematic, high quality, photorealistic: ${subject}. Ultra detailed, dramatic lighting, 4K.`, subject };
      }

      return new Response(JSON.stringify({ reply, didSearch: false, searchQuery: "", tool_call: toolCall }), {
        status: 200, headers: jsonHeaders,
      });
    }

    // Detect fresh creation intent — always ask clarifying question first
    const creationType = detectCreationIntent(safeMsg);
    if (creationType) {
      const subject = extractSubject(safeMsg, creationType);
      const reply   = buildClarifyingMessage(creationType, subject);
      return new Response(JSON.stringify({
        reply,
        didSearch: false,
        searchQuery: "",
        clarification_for: creationType,
      }), { status: 200, headers: jsonHeaders });
    }

    /* ── Web search (keyword router) ────────────────────────── */
    let didSearch   = false;
    let searchQuery = "";
    let webContext  = "";

    if (needsWebSearch(safeMsg)) {
      searchQuery = safeMsg.length > 120 ? safeMsg.slice(0, 120) : safeMsg;
      webContext  = await tavilySearch(searchQuery);
      didSearch   = webContext.length > 0;
    }

    /* ── Build contents for AI ──────────────────────────────── */
    const systemText = system || SYSTEM;
    const webNote    = webContext
      ? `\n\n[LIVE WEB DATA for: "${searchQuery}"]\n${webContext}\n[END]\n\nUse the above to answer accurately and cite sources.`
      : "";

    const historyContents: GeminiContent[] = history.slice(-14).map(m => ({
      role:  m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content || "" }],
    }));

    const userParts: GeminiContent["parts"] = [];
    if (imageBase64) userParts.push({ inline_data: { mime_type: imageMime || "image/jpeg", data: imageBase64 } });
    userParts.push({ text: (message || "Describe this image in detail.") + webNote });

    const contents: GeminiContent[] = [
      { role: "user",  parts: [{ text: systemText }] },
      { role: "model", parts: [{ text: "Understood. I am AlphaTekx OS — ready to assist anyone, anywhere. 🚀" }] },
      ...historyContents,
      { role: "user",  parts: userParts },
    ];

    const reply = await callAIWithFallback(gatewayKey, contents, !!imageBase64);

    return new Response(
      JSON.stringify({ reply: reply || "I couldn't generate a response. Please try again.", didSearch, searchQuery }),
      { status: 200, headers: jsonHeaders },
    );

  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("Handler error:", msg);
    return new Response(
      JSON.stringify({
        reply: `⚠️ Something went wrong on my end. Please try again in a moment.\n\n_Error: ${msg.slice(0, 120)}_`,
        didSearch: false, searchQuery: "",
      }),
      { status: 200, headers: jsonHeaders },
    );
  }
});
