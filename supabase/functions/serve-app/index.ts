/* ═══════════════════════════════════════════════════════════════
   AlphaTekx — Serve App Edge Function v2
   Public endpoint (verify_jwt = false in config.toml).
   Reads a deployed app's HTML from `deployed_apps` by slug
   and serves it as a full text/html page — sharable, no auth needed.

   URL pattern:
     GET /functions/v1/serve-app?slug=my-app-xxxx
═══════════════════════════════════════════════════════════════ */

import { createClient } from "npm:@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });

  const url  = new URL(req.url);
  const slug = url.searchParams.get("slug")?.trim();

  if (!slug) {
    return new Response(errorPage("Missing slug", "Provide a ?slug= parameter in the URL."), {
      status: 400,
      headers: { ...CORS, "Content-Type": "text/html; charset=utf-8" },
    });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey  = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const db = createClient(supabaseUrl, serviceKey);

  const { data, error } = await db
    .from("deployed_apps")
    .select("html_code, title, is_live")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data) {
    return new Response(errorPage("App not found", `No app with slug <strong>${slug}</strong> exists.`), {
      status: 404,
      headers: { ...CORS, "Content-Type": "text/html; charset=utf-8" },
    });
  }

  // Serve any app that has HTML — is_live=false just means unpublished, still serve it
  if (!data.html_code?.trim()) {
    return new Response(errorPage("Empty app", "This app has no content yet."), {
      status: 410,
      headers: { ...CORS, "Content-Type": "text/html; charset=utf-8" },
    });
  }

  return new Response(data.html_code, {
    status: 200,
    headers: {
      ...CORS,
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
      "X-Content-Type-Options": "nosniff",
      // Allow embedding from anywhere (preview iframes + external sites)
      "Content-Security-Policy": "frame-ancestors *",
    },
  });
});

function errorPage(title: string, detail: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>${title} — AlphaTekx</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{background:#050915;color:#e2e8f0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
       min-height:100vh;display:flex;align-items:center;justify-content:center;padding:2rem}
  .card{background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.10);
        border-radius:20px;padding:3rem 2.5rem;max-width:480px;width:100%;text-align:center}
  h1{font-size:1.6rem;font-weight:800;margin-bottom:0.75rem;color:#f8fafc}
  p{color:rgba(255,255,255,0.45);line-height:1.6;font-size:0.925rem}
  a{color:#60a5fa;text-decoration:none}
  a:hover{text-decoration:underline}
  .badge{display:inline-block;margin-bottom:1.5rem;font-size:0.75rem;font-weight:700;
         letter-spacing:0.1em;color:rgba(96,165,250,0.55);text-transform:uppercase}
</style>
</head>
<body>
  <div class="card">
    <div class="badge">AlphaTekx Deploy</div>
    <h1>${title}</h1>
    <p>${detail}</p>
    <p style="margin-top:1.5rem"><a href="https://alphatekx.name.ng">← Back to AlphaTekx</a></p>
  </div>
</body>
</html>`;
}
