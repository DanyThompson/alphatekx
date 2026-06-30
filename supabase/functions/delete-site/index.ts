/**
 * delete-site — permanently remove a deployed site.
 *
 * 1. Verifies the caller owns the subdomain (via auth JWT + DB check)
 * 2. Lists and deletes all files in Storage bucket `sites/<subdomain>/`
 * 3. Deletes the `site_deployments` row
 *
 * POST /functions/v1/delete-site
 * Body: { subdomain: string }
 * Auth: Bearer <user JWT>  (required)
 */

import { createClient } from 'npm:@supabase/supabase-js@2';

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  /* ── Auth: extract user from JWT ─────────────────────────── */
  const authHeader = req.headers.get('Authorization') ?? '';
  const userToken  = authHeader.replace(/^Bearer\s+/i, '');
  if (!userToken) return json({ error: 'Missing authorization token' }, 401);

  const supabaseUrl    = Deno.env.get('SUPABASE_URL')!;
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

  /* User client — scoped to caller's permissions */
  const userClient = createClient(supabaseUrl, userToken, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  /* Admin client — for storage deletion + row deletion bypassing RLS */
  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  /* Verify JWT is valid */
  const { data: { user }, error: userErr } = await userClient.auth.getUser();
  if (userErr || !user) return json({ error: 'Invalid or expired token' }, 401);

  /* ── Parse body ──────────────────────────────────────────── */
  let subdomain: string;
  try {
    const body = await req.json();
    subdomain  = (body?.subdomain ?? '').toString().trim().toLowerCase();
  } catch {
    return json({ error: 'Invalid JSON body' }, 400);
  }
  if (!subdomain) return json({ error: 'subdomain is required' }, 400);
  if (!/^[a-z0-9-]+$/.test(subdomain)) return json({ error: 'Invalid subdomain' }, 400);

  /* ── Ownership check: caller must own this deployment ────── */
  const { data: dep, error: depErr } = await admin
    .from('site_deployments')
    .select('id, user_id')
    .eq('subdomain', subdomain)
    .maybeSingle();

  if (depErr)  return json({ error: `DB lookup failed: ${depErr.message}` }, 500);
  if (!dep)    return json({ error: 'Deployment not found' }, 404);
  if (dep.user_id !== user.id) return json({ error: 'Forbidden' }, 403);

  /* ── Delete all storage files under sites/<subdomain>/ ───── */
  const { data: fileList, error: listErr } = await admin.storage
    .from('sites')
    .list(subdomain, { limit: 1000 });

  if (listErr) {
    console.error('[delete-site] list error:', listErr.message);
    // Non-fatal — proceed to DB deletion even if listing fails
  }

  if (fileList && fileList.length > 0) {
    const paths = fileList.map((f: { name: string }) => `${subdomain}/${f.name}`);
    const { error: removeErr } = await admin.storage.from('sites').remove(paths);
    if (removeErr) {
      console.error('[delete-site] storage remove error:', removeErr.message);
      // Non-fatal — files may already be gone
    }
  }

  /* Also try to remove nested folders (assets/, etc.) */
  const NESTED = ['assets', 'css', 'js', 'images', 'fonts', 'static'];
  for (const folder of NESTED) {
    const { data: nested } = await admin.storage
      .from('sites')
      .list(`${subdomain}/${folder}`, { limit: 500 });
    if (nested && nested.length > 0) {
      const paths = nested.map((f: { name: string }) => `${subdomain}/${folder}/${f.name}`);
      await admin.storage.from('sites').remove(paths);
    }
  }

  /* ── Delete the deployment row ───────────────────────────── */
  const { error: deleteErr } = await admin
    .from('site_deployments')
    .delete()
    .eq('id', dep.id);

  if (deleteErr) return json({ error: `Failed to delete deployment: ${deleteErr.message}` }, 500);

  console.log(`[delete-site] Deleted ${subdomain} for user ${user.id}`);
  return json({ success: true, subdomain });
});
