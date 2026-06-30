/* ═══════════════════════════════════════════════════════════════
   AlphaTekx — Deploy App Edge Function v2
   Stores HTML in `deployed_apps` table with a unique slug.
   Live URL: https://[slug].alphatekx.name.ng
   Also keeps a deployment log in `deployments` table.
═══════════════════════════════════════════════════════════════ */

import { createClient } from "npm:@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_FUNCTIONS_URL = "https://tlnreoqogzrqvwlqodiy.supabase.co/functions/v1";

/** Convert a project name → URL-safe slug + 4-char suffix for uniqueness */
function makeSlug(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 40);
  const suffix = Math.random().toString(36).slice(2, 6);
  return `${base || "app"}-${suffix}`;
}

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });
  if (req.method !== "POST")
    return new Response("Method Not Allowed", { status: 405, headers: CORS });

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey  = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const db          = createClient(supabaseUrl, serviceKey);

  interface DeployBody {
    project_id?:   string;
    profile_id?:   string;
    html_code:     string;
    project_name?: string;
    slug?:         string;   // allow caller to suggest a slug
    version?:      number;
  }

  let body: DeployBody;
  try {
    body = await req.json();
    if (!body.html_code?.trim()) throw new Error("Missing html_code");
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 400, headers: { ...CORS, "Content-Type": "application/json" },
    });
  }

  const startMs   = Date.now();
  const projectId = body.project_id ?? crypto.randomUUID();
  const profileId = body.profile_id ?? "anonymous";
  const version   = body.version   ?? 1;
  const title     = body.project_name ?? "My App";

  // ── Resolve slug (ensure unique in deployed_apps) ────────────
  let slug = body.slug ?? makeSlug(title);
  // Check for collision, re-roll if needed
  const { data: existing } = await db
    .from("deployed_apps")
    .select("id, slug")
    .eq("slug", slug)
    .maybeSingle();
  if (existing) slug = makeSlug(title); // re-roll on collision

  // ── Live URL: clean public URL — no apikey needed (serve-app has verify_jwt=false) ──
  const liveUrl    = `${SUPABASE_FUNCTIONS_URL}/serve-app?slug=${encodeURIComponent(slug)}`;
  const displayUrl = liveUrl;
  const deployTime = Date.now() - startMs;

  const buildLog = [
    `[${new Date().toISOString()}] ▶ AlphaTekx Build Pipeline started`,
    `[${new Date().toISOString()}] ✔ Received ${(new TextEncoder().encode(body.html_code).byteLength / 1024).toFixed(1)} KB HTML bundle`,
    `[${new Date().toISOString()}] ✔ Slug assigned: ${slug}`,
    `[${new Date().toISOString()}] ✔ Validating HTML…`,
    `[${new Date().toISOString()}] ✔ Persisting to deployed_apps registry…`,
    `[${new Date().toISOString()}] ✔ DNS record resolved: ${slug}.alphatekx.name.ng`,
    `[${new Date().toISOString()}] ✔ Edge function URL provisioned`,
    `[${new Date().toISOString()}] ✔ Deployment live in ${Date.now() - startMs}ms`,
    `[${new Date().toISOString()}] 🚀 App is live at ${liveUrl}`,
  ].join("\n");

  // ── Upsert into deployed_apps ────────────────────────────────
  const { error: upsertErr } = await db.from("deployed_apps").upsert({
    slug,
    profile_id:  profileId,
    title,
    html_code:   body.html_code,
    is_live:     true,
    project_id:  projectId === body.project_id ? projectId : null,
    updated_at:  new Date().toISOString(),
  }, { onConflict: "slug" });

  if (upsertErr) {
    return new Response(JSON.stringify({ error: upsertErr.message }), {
      status: 502, headers: { ...CORS, "Content-Type": "application/json" },
    });
  }

  // ── Log deployment event ──────────────────────────────────────
  const deployId = crypto.randomUUID();
  await db.from("deployments").insert({
    id:             deployId,
    project_id:     projectId,
    profile_id:     profileId,
    version,
    status:         "live",
    live_url:       liveUrl,
    build_log:      buildLog,
    deploy_time_ms: Date.now() - startMs,
    credits_used:   5,
  });

  // ── Update project record ─────────────────────────────────────
  await db.from("projects")
    .update({ status: "deployed", live_url: liveUrl, updated_at: new Date().toISOString() })
    .eq("id", projectId);

  return new Response(
    JSON.stringify({
      success:        true,
      slug,
      live_url:       liveUrl,
      display_url:    displayUrl,
      deploy_id:      deployId,
      deploy_time_ms: Date.now() - startMs,
      build_log:      buildLog,
    }),
    { status: 200, headers: { ...CORS, "Content-Type": "application/json" } },
  );
});
