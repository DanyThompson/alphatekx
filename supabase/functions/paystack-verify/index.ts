import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Must stay in sync with CreditsPage.tsx and BuyCreditsModal.tsx PACKS arrays
const PACK_CREDITS: Record<string, number> = {
  starter:    50,
  popular:   300,   // BuyCreditsModal legacy pack
  growth:    300,   // CreditsPage pack
  pro:       700,
  enterprise: 2000,
};

// Minimum expected price in NGN — must be >= to prevent amount tampering
const PACK_NGN_MIN: Record<string, number> = {
  starter:    2500,
  popular:    7500,
  growth:     9000,  // Accept if user paid at least ₦9,000 for the ₦10,000 growth pack (small buffer for FX)
  pro:       14000,  // Accept ₦14k+ for the ₦15k/₦20k pro pack
  enterprise: 45000, // Accept ₦45k+ for the ₦50k enterprise pack
};

// Simple in-memory rate limiter: max 10 verify calls per IP per minute
const ipHits = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = ipHits.get(ip);
  if (!entry || now > entry.resetAt) {
    ipHits.set(ip, { count: 1, resetAt: now + 60_000 });
    return false;
  }
  entry.count++;
  if (entry.count > 10) return true;
  return false;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });

  // Rate-limit by IP
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (isRateLimited(ip)) {
    return new Response(JSON.stringify({ error: 'Too many requests. Please wait a moment.' }), {
      status: 429, headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }

  try {
    const { reference, pack, profile_id } = await req.json();

    // ── Input validation ──────────────────────────────────────────────────
    if (!reference || typeof reference !== 'string' || reference.length > 200) {
      return new Response(JSON.stringify({ error: 'Invalid reference' }), {
        status: 400, headers: { ...CORS, 'Content-Type': 'application/json' },
      });
    }
    if (!pack || !PACK_CREDITS[pack as string]) {
      return new Response(JSON.stringify({ error: 'Invalid pack' }), {
        status: 400, headers: { ...CORS, 'Content-Type': 'application/json' },
      });
    }    if (!profile_id || typeof profile_id !== 'string') {
      return new Response(JSON.stringify({ error: 'Missing profile_id' }), {
        status: 400, headers: { ...CORS, 'Content-Type': 'application/json' },
      });
    }

    const credits    = PACK_CREDITS[pack as string];
    const minAmtNgn  = PACK_NGN_MIN[pack as string] ?? 0;

    // ── Supabase admin client ─────────────────────────────────────────────
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // ── Idempotency: check if reference already processed ────────────────
    const { data: existingLog } = await supabase
      .from('payment_logs')
      .select('id, credits_added')
      .eq('reference', reference)
      .maybeSingle();

    if (existingLog) {
      // Already processed — return success (idempotent, safe for retries)
      return new Response(JSON.stringify({
        success: true,
        credits_added: existingLog.credits_added,
        already_processed: true,
      }), { headers: { ...CORS, 'Content-Type': 'application/json' } });
    }

    // ── Verify payment with Paystack ──────────────────────────────────────
    const paystackKey = Deno.env.get('PAYSTACK_SECRET_KEY');
    if (!paystackKey) throw new Error('Paystack key not configured');

    const verifyRes = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      { headers: { Authorization: `Bearer ${paystackKey}` } }
    );

    if (!verifyRes.ok) {
      return new Response(JSON.stringify({ error: 'Paystack API error', detail: `HTTP ${verifyRes.status}` }), {
        status: 502, headers: { ...CORS, 'Content-Type': 'application/json' },
      });
    }

    const verifyData = await verifyRes.json();

    if (!verifyData.status || verifyData.data?.status !== 'success') {
      return new Response(JSON.stringify({
        error:  'Payment not verified',
        detail: verifyData.message || verifyData.data?.gateway_response || 'Transaction status: ' + verifyData.data?.status,
      }), {
        status: 402, headers: { ...CORS, 'Content-Type': 'application/json' },
      });
    }

    // Validate amount paid >= minimum expected pack price (prevent tampered amounts)
    const paidAmountNgn = Math.round((verifyData.data?.amount || 0) / 100);
    if (paidAmountNgn < minAmtNgn) {
      return new Response(JSON.stringify({
        error:   'Payment amount too low for this pack',
        paid:    paidAmountNgn,
        minimum: minAmtNgn,
      }), {
        status: 402, headers: { ...CORS, 'Content-Type': 'application/json' },
      });
    }

    // ── Add credits atomically ────────────────────────────────────────────
    const { data: newBalance, error: rpcErr } = await supabase.rpc('add_credits', {
      p_profile_id: profile_id,
      p_amount:     credits,
    });
    if (rpcErr) throw new Error('add_credits RPC failed: ' + rpcErr.message);

    // ── Record payment log for idempotency + audit trail ──────────────────
    const { error: logErr } = await supabase.from('payment_logs').insert({
      reference,
      profile_id,
      pack,
      credits_added: credits,
      amount_ngn:    paidAmountNgn,
    });

    // Log insert failure as warning but do NOT fail the request — credits are already added
    if (logErr) {
      console.warn('payment_logs insert warning (credits already added):', logErr.message);
    }

    return new Response(JSON.stringify({
      success:       true,
      credits_added: credits,
      new_balance:   newBalance,
    }), {
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500, headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }
});
