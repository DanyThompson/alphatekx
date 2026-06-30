import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { createHmac } from 'node:crypto';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-paystack-signature',
};

const PLANS: Record<string, { credits: number; amountKobo: number }> = {
  starter:    { credits: 10,  amountKobo: 50000   },  // ₦500
  pro:        { credits: 50,  amountKobo: 200000  },  // ₦2000
  enterprise: { credits: 150, amountKobo: 500000  },  // ₦5000
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });

  const rawBody = await req.text();

  try {
    const paystackSecret = Deno.env.get('PAYSTACK_SECRET_KEY') ?? '';
    const signature = req.headers.get('x-paystack-signature') ?? '';

    // Verify Paystack webhook signature
    if (signature) {
      const hash = createHmac('sha512', paystackSecret).update(rawBody).digest('hex');
      if (hash !== signature) {
        return new Response(JSON.stringify({ error: 'Invalid signature' }), {
          status: 401,
          headers: { ...CORS, 'Content-Type': 'application/json' },
        });
      }
    }

    const event = JSON.parse(rawBody);

    if (event.event !== 'charge.success') {
      return new Response(JSON.stringify({ received: true }), { status: 200, headers: { ...CORS, 'Content-Type': 'application/json' } });
    }

    const { reference, customer, metadata, amount } = event.data;
    const email = customer?.email ?? metadata?.email ?? '';
    const planKey = (metadata?.plan_key ?? '').toLowerCase();
    const plan = PLANS[planKey];

    if (!plan) {
      console.error('Unknown plan_key:', planKey);
      return new Response(JSON.stringify({ error: 'Unknown plan' }), { status: 400, headers: { ...CORS, 'Content-Type': 'application/json' } });
    }

    // Verify amount paid >= expected (prevent tampering)
    if (Number(amount) < plan.amountKobo * 0.95) {
      console.error('Amount mismatch:', amount, 'expected', plan.amountKobo);
      return new Response(JSON.stringify({ error: 'Amount mismatch' }), { status: 400, headers: { ...CORS, 'Content-Type': 'application/json' } });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // Check idempotency — don't process same reference twice
    const { data: already } = await supabase
      .from('transaction_history')
      .select('id')
      .eq('reference', reference)
      .maybeSingle();

    if (already) {
      return new Response(JSON.stringify({ received: true, duplicate: true }), { status: 200, headers: { ...CORS, 'Content-Type': 'application/json' } });
    }

    // Find user by email
    const { data: profile, error: profErr } = await supabase
      .from('profiles')
      .select('id, credit_balance')
      .eq('email', email)
      .maybeSingle();

    if (profErr || !profile) {
      console.error('Profile not found for email:', email, profErr);
      return new Response(JSON.stringify({ error: 'User not found' }), { status: 404, headers: { ...CORS, 'Content-Type': 'application/json' } });
    }

    // Atomically increment credits
    const newBalance = Number(profile.credit_balance) + plan.credits;
    const { error: updateErr } = await supabase
      .from('profiles')
      .update({ credit_balance: newBalance })
      .eq('id', profile.id);
    if (updateErr) throw updateErr;

    // Log transaction
    await supabase.from('transaction_history').insert({
      user_id: profile.id,
      type: 'credit',
      amount: plan.credits,
      action_type: 'top_up',
      reference,
    });

    return new Response(JSON.stringify({ success: true, new_balance: newBalance }), {
      status: 200,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('verify-payment error:', err);
    return new Response(JSON.stringify({ error: 'Server error' }), {
      status: 500,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }
});
