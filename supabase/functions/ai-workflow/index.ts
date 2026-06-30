/**
 * AI Workflow Edge Function
 * Chains: Script (alphatekx-chat) → Voiceover (text-to-speech) → Video (kling-omni-video-submit) → Vault (workflow_results)
 * Called by WorkflowPage frontend — orchestrates all steps server-side.
 */
import { createClient } from 'jsr:@supabase/supabase-js@2';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS });
  if (req.method !== 'POST') return json({ error: 'Method Not Allowed' }, 405);

  const SUPABASE_URL        = Deno.env.get('SUPABASE_URL')!;
  const SERVICE_ROLE        = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const INTEGRATIONS_KEY    = Deno.env.get('INTEGRATIONS_API_KEY')!;
  const GEMINI_GATEWAY      = 'https://app-cgqteick6nep-api-VaOwP8E7dJqa.gateway.appmedo.com/v1beta/models/gemini-2.5-flash:generateContent';
  const TTS_GATEWAY         = 'https://app-cgqteick6nep-api-VaOwP8E7dJqa.gateway.appmedo.com/v1/audio/speech';
  const KLING_GATEWAY       = 'https://app-cgqteick6nep-api-k93RvqRrRZba.gateway.appmedo.com/v1/videos/omni-video';

  let body: { topic: string; voice?: string; style?: string; userId?: string };
  try { body = await req.json(); } catch { return json({ error: 'Invalid JSON' }, 400); }

  const { topic, voice = 'heart', style = 'Cinematic', userId } = body;
  if (!topic?.trim()) return json({ error: 'topic is required' }, 400);

  const sb = createClient(SUPABASE_URL, SERVICE_ROLE);
  const result: Record<string, unknown> = { topic, style, voice };

  /* ── Step 1: Script ─────────────────────────────────────────── */
  let scriptText = '';
  try {
    const prompt = `Write a ${style.toLowerCase()} video script about: "${topic.trim()}". Hook, 3 key points, strong CTA. ~200 words. Start directly.`;
    const res = await fetch(`${GEMINI_GATEWAY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Gateway-Authorization': `Bearer ${INTEGRATIONS_KEY}` },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    });
    const data = await res.json();
    scriptText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    if (!scriptText) throw new Error('Empty script response');
    result.scriptText = scriptText;
    result.scriptDone = true;
  } catch (e) {
    return json({ error: 'Script step failed: ' + (e as Error).message, result }, 500);
  }

  /* ── Step 2: Voiceover ──────────────────────────────────────── */
  let audioUrl: string | null = null;
  try {
    const ttsInput = scriptText.replace(/^##.*$/gm, '').replace(/\*\*/g, '').trim().slice(0, 2500);
    const ttsRes = await fetch(TTS_GATEWAY, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Gateway-Authorization': `Bearer ${INTEGRATIONS_KEY}` },
      body: JSON.stringify({ model: 'tts-1', input: ttsInput, voice, response_format: 'mp3' }),
    });
    if (!ttsRes.ok) throw new Error(`TTS HTTP ${ttsRes.status}`);
    const buf = await ttsRes.arrayBuffer();
    const bytes = new Uint8Array(buf);
    if (bytes.length === 0) throw new Error('Empty audio');

    // Upload to Supabase Storage
    const filePath = `workflow/${crypto.randomUUID()}.mp3`;
    const { data: up, error: upErr } = await sb.storage.from('generated-media').upload(filePath, bytes, {
      contentType: 'audio/mpeg', cacheControl: '86400', upsert: false,
    });
    if (!upErr && up) {
      const { data: urlData } = sb.storage.from('generated-media').getPublicUrl(filePath);
      audioUrl = urlData.publicUrl;
    } else {
      // Fallback: base64
      const b64 = btoa(String.fromCharCode(...bytes));
      audioUrl = `data:audio/mpeg;base64,${b64}`;
    }
    result.audioUrl = audioUrl;
    result.voiceDone = true;
  } catch (e) {
    result.voiceError = (e as Error).message;
    // Non-fatal — continue to video
  }

  /* ── Step 3: Video (non-fatal) ──────────────────────────────── */
  let videoTaskId: string | null = null;
  try {
    const videoPrompt = `${style} video: ${topic.trim()}. Professional visuals.`;
    const vRes = await fetch(KLING_GATEWAY, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Gateway-Authorization': `Bearer ${INTEGRATIONS_KEY}` },
      body: JSON.stringify({ prompt: videoPrompt, duration: 5, aspect_ratio: '16:9', mode: 'std' }),
    });
    if (vRes.ok) {
      const vData = await vRes.json();
      videoTaskId = vData?.task_id || null;
    }
    result.videoTaskId = videoTaskId;
    result.videoDone = true;
  } catch {
    result.videoError = 'Video step skipped';
  }

  /* ── Step 4: Vault ──────────────────────────────────────────── */
  try {
    const { data: row } = await sb.from('workflow_results').insert({
      user_id: userId || null,
      title: `AI Workflow — ${topic.trim().slice(0, 60)}`,
      content: scriptText,
      audio_url: audioUrl,
      video_task_id: videoTaskId,
      style,
      voice,
    }).select('id').maybeSingle();
    result.vaultId  = (row as { id: string } | null)?.id || null;
    result.vaultDone = true;
  } catch (e) {
    result.vaultError = (e as Error).message;
  }

  return json({ success: true, result });
});
