/* ═══════════════════════════════════════════════════════════════
   AlphaTekx — App Fetcher Edge Function
   Called by the subdomain router to retrieve an app by slug.
   Returns full HTML or 404 with redirect info.
═══════════════════════════════════════════════════════════════ */

import { createClient } from "npm:@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MAIN_DOMAIN = "https://alphatekx.name.ng";

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });

  const url  = new URL(req.url);
  const slug = url.searchParams.get("slug")?.trim().toLowerCase();

  if (!slug) {
    return new Response(JSON.stringify({ error: "Missing slug parameter" }), {
      status: 400, headers: { ...CORS, "Content-Type": "application/json" },
    });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey  = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const db          = createClient(supabaseUrl, serviceKey);

  const { data, error } = await db
    .from("deployed_apps")
    .select("id, slug, title, html_code, is_live, views")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data) {
    return new Response(
      JSON.stringify({ found: false, redirect: MAIN_DOMAIN }),
      { status: 404, headers: { ...CORS, "Content-Type": "application/json" } },
    );
  }

  if (!data.is_live) {
    return new Response(
      JSON.stringify({ found: false, reason: "offline", redirect: MAIN_DOMAIN }),
      { status: 410, headers: { ...CORS, "Content-Type": "application/json" } },
    );
  }

  // Async view increment (fire-and-forget)
  db.rpc("increment_app_views", { p_slug: slug }).then(null, () => null);

  // Serve the HTML directly so visiting this URL renders the app in the browser
  return new Response(data.html_code, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
      "X-App-Slug": data.slug,
      "X-App-Title": encodeURIComponent(data.title),
    },
  });
});
