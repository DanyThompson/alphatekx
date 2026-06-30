/**
 * serve-site — proxy Supabase Storage files without restrictive CSP.
 *
 * Supabase Storage adds `Content-Security-Policy: default-src 'none'; sandbox`
 * to every public/authenticated URL, which blocks ALL scripts, stylesheets and
 * sub-resources in deployed sites.
 *
 * This function uses the Supabase JS admin client to download files directly
 * from the `sites` bucket (bypassing the HTTP Storage URL and its CSP), then
 * re-serves the content with permissive headers.
 *
 * URL pattern (verify_jwt = false — no auth required by callers):
 *   GET /functions/v1/serve-site/<subdomain>/<path...>
 *   e.g. /functions/v1/serve-site/myapp/index.html
 *        /functions/v1/serve-site/myapp/assets/style.css
 */

import { createClient } from 'npm:@supabase/supabase-js@2';

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function guessMime(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() ?? '';
  const map: Record<string, string> = {
    html: 'text/html; charset=utf-8',
    htm:  'text/html; charset=utf-8',
    css:  'text/css; charset=utf-8',
    js:   'application/javascript; charset=utf-8',
    mjs:  'application/javascript; charset=utf-8',
    json: 'application/json; charset=utf-8',
    svg:  'image/svg+xml',
    png:  'image/png',
    jpg:  'image/jpeg',
    jpeg: 'image/jpeg',
    gif:  'image/gif',
    webp: 'image/webp',
    ico:  'image/x-icon',
    woff: 'font/woff',
    woff2:'font/woff2',
    ttf:  'font/ttf',
    txt:  'text/plain; charset=utf-8',
    xml:  'text/xml; charset=utf-8',
    pdf:  'application/pdf',
  };
  return map[ext] ?? 'application/octet-stream';
}

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'GET')
    return new Response('Method not allowed', { status: 405, headers: CORS });

  // Supabase strips /functions/v1 inside the runtime, so pathname is /serve-site/<rest>
  // Handle both internal (/serve-site/…) and external (/functions/v1/serve-site/…) forms.
  const url      = new URL(req.url);
  const segments = url.pathname
    .replace(/^\/functions\/v1\/serve-site/, '')
    .replace(/^\/serve-site/, '')
    .replace(/^\//, '')
    .split('/')
    .filter(Boolean);

  if (segments.length < 1) {
    return new Response('Usage: /serve-site/<subdomain>/<path>', { status: 400, headers: CORS });
  }

  const subdomain = segments[0];
  const filePath  = segments.slice(1).join('/') || 'index.html';
  const storagePath = `${subdomain}/${filePath}`;

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceKey  = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

  // Admin client — bypasses RLS; download() returns the raw Blob, no CSP attached
  const admin = createClient(supabaseUrl, serviceKey);

  const { data: blob, error } = await admin.storage
    .from('sites')
    .download(storagePath);

  if (error || !blob) {
    console.error('[serve-site] download error:', error?.message, 'path:', storagePath);
    if (error?.message?.includes('not found') || error?.message?.includes('Object not found')) {
      return new Response(`Not found: ${storagePath}`, { status: 404, headers: CORS });
    }
    return new Response(`Could not load file: ${error?.message ?? 'unknown'}`, { status: 502, headers: CORS });
  }

  const body        = await blob.arrayBuffer();
  const contentType = guessMime(filePath);
  const isHtml      = contentType.startsWith('text/html');

  // For HTML: serve as UTF-8 string (same pattern as serve-app — avoids platform CSP override).
  // For assets (CSS/JS/images): serve as ArrayBuffer with explicit permissive CSP.
  const responseBody = isHtml ? new TextDecoder().decode(body) : body;

  const headers: Record<string, string> = {
    ...CORS,
    'Content-Type':  contentType,
    'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
    'X-Frame-Options': 'ALLOWALL',
  };

  if (isHtml) {
    // frame-ancestors only — matches the proven serve-app pattern that survives Supabase's header injection
    headers['Content-Security-Policy'] = "frame-ancestors *";
  } else {
    // Full permissive CSP for assets
    headers['Content-Security-Policy'] =
      "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob: https: http:; " +
      "img-src * data: blob:; font-src * data:; media-src *;";
  }

  return new Response(responseBody, { status: 200, headers });
});
