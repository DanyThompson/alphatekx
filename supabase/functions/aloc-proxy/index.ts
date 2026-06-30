import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS });
  }

  try {
    const { subject, year, type } = await req.json();

    if (!subject || !year || !type) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters: subject, year, type' }),
        { status: 400, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
      );
    }

    const alocToken = Deno.env.get('ALOC_TOKEN');
    if (!alocToken) {
      return new Response(
        JSON.stringify({ error: 'ALOC_TOKEN secret is not configured' }),
        { status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
      );
    }

    // Build ALOC API URL
    const params = new URLSearchParams({ subject, year: String(year), type });
    const alocUrl = `https://questions.aloc.com.ng/api/v2/q/40?${params.toString()}`;

    const alocResponse = await fetch(alocUrl, {
      method: 'GET',
      headers: {
        'AccessToken': alocToken,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (!alocResponse.ok) {
      const errText = await alocResponse.text();
      return new Response(
        JSON.stringify({ error: `ALOC API error: ${alocResponse.status} - ${errText}` }),
        { status: alocResponse.status, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
      );
    }

    const alocData = await alocResponse.json();

    // ALOC returns { status, message, data: [...questions] }
    const rawQuestions = alocData?.data ?? alocData?.questions ?? [];

    if (!Array.isArray(rawQuestions) || rawQuestions.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No questions available for the selected subject, year, and exam type.' }),
        { status: 404, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
      );
    }

    // Normalise question shape
    const questions = rawQuestions.map((q: Record<string, unknown>) => ({
      id: q.id ?? q._id ?? Math.random().toString(36).slice(2),
      question: q.question ?? q.body ?? '',
      option: {
        a: (q.option as Record<string, string>)?.a ?? (q.options as Record<string, string>)?.a ?? '',
        b: (q.option as Record<string, string>)?.b ?? (q.options as Record<string, string>)?.b ?? '',
        c: (q.option as Record<string, string>)?.c ?? (q.options as Record<string, string>)?.c ?? '',
        d: (q.option as Record<string, string>)?.d ?? (q.options as Record<string, string>)?.d ?? '',
      },
      answer: ((q.answer ?? q.correct_answer ?? '') as string).toLowerCase(),
      solution: q.solution ?? q.explanation ?? null,
      image: q.image ?? null,
    }));

    return new Response(
      JSON.stringify({ questions, total: questions.length }),
      { status: 200, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('aloc-proxy error:', err);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
    );
  }
});
