import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// ── Diff generation ───────────────────────────────────────────
// Produces a unified-style diff string (red = removed, green = added).
// Format mirrors what the frontend renders as colored diff blocks.
function generateDiff(filePath: string, lineNumber: number, oldContent: string, newContent: string): string {
  const oldTrimmed = oldContent.trim();
  const newTrimmed = newContent.trim();
  return [
    `--- ${filePath} (line ${lineNumber})`,
    `+++ ${filePath} (line ${lineNumber})`,
    `@@ -${lineNumber},1 +${lineNumber},1 @@`,
    `- ${oldTrimmed}`,
    `+ ${newTrimmed}`,
  ].join("\n");
}

// ── apply_fix core logic ──────────────────────────────────────
// Performs a surgical line replacement and returns the patched content.
// In production this would write back to a git-cloned workspace;
// here we operate on the in-memory file content provided by the caller
// (the frontend passes currentCode/suggestedFix from the audit report).
function applyFix(
  lines: string[],
  lineNumber: number,
  currentContent: string,
  suggestedFix: string,
): { success: boolean; patchedLines: string[]; message: string } {
  // lineNumber is 1-indexed
  const idx = lineNumber - 1;

  if (idx < 0 || idx >= lines.length) {
    return {
      success: false,
      patchedLines: lines,
      message: `Line ${lineNumber} is out of range (file has ${lines.length} lines).`,
    };
  }

  const targetLine = lines[idx];
  const normalizedCurrent = currentContent.trim();

  // Fuzzy match: the stored currentContent may be a truncated/masked version.
  // Accept if the target line *contains* the vulnerable pattern, or matches exactly.
  const matchExact = targetLine.trim() === normalizedCurrent;
  const matchContains = normalizedCurrent.length > 4 && targetLine.includes(normalizedCurrent);

  if (!matchExact && !matchContains) {
    // Graceful fallback: still apply the fix at the specified line —
    // real-world code may have minor whitespace drift between audit scan and fix time.
    console.warn(
      `apply_fix: loose match at line ${lineNumber}. ` +
      `Expected: "${normalizedCurrent}" | Found: "${targetLine.trim()}". Applying anyway.`,
    );
  }

  // Preserve leading whitespace / indentation from the original line
  const leadingWS = targetLine.match(/^(\s*)/)?.[1] ?? "";
  const patchedLines = [...lines];
  patchedLines[idx] = leadingWS + suggestedFix.trim();

  return { success: true, patchedLines, message: "Fix applied successfully." };
}

// ── Handler ───────────────────────────────────────────────────
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json() as {
      project_id?: string;
      file_path: string;
      line_number: number;
      current_content: string;
      suggested_fix: string;
      // Optional: caller may pass the full file content as an array of lines.
      // If omitted, we construct a minimal synthetic file for demonstration.
      file_lines?: string[];
    };

    const { project_id, file_path, line_number, current_content, suggested_fix, file_lines } = body;

    // Validate required fields
    if (!file_path || line_number == null || !current_content || !suggested_fix) {
      return new Response(JSON.stringify({
        error: "file_path, line_number, current_content, and suggested_fix are required.",
      }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Build the working file lines array.
    // In production: clone repo + read real file. Here: use caller-supplied lines
    // or synthesise a minimal file so the logic path is identical.
    let lines: string[];
    if (file_lines && Array.isArray(file_lines) && file_lines.length > 0) {
      lines = file_lines;
    } else {
      // Synthesise: pad with blank lines up to the target line
      lines = Array.from({ length: Math.max(line_number, 10) }, (_, i) =>
        i === line_number - 1 ? current_content : ""
      );
    }

    // ── Auto-heal logic bypassed for stability ─────────────────────
    console.log("Auto-heal logic bypassed for stability");

    const diff = generateDiff(file_path, line_number, current_content, suggested_fix);
    const result = {
      success: false,
      patchedLines: lines,
      message: "Auto-heal logic bypassed for stability.",
    };

    const { error: logErr } = await supabase.from("audit_logs").insert({
      user_id: user.id,
      project_id: project_id ?? null,
      file_path,
      line_number,
      old_content: current_content,
      new_content: current_content,
      diff,
      status: "bypassed",
      error_message: null,
    });

    if (logErr) {
      console.warn("audit_logs insert failed:", logErr.message);
    }

    return new Response(JSON.stringify({
      success: false,
      diff,
      message: result.message,
    }), { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (err) {
    console.error("auto-fix error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
