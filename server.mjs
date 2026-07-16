import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

function loadEnv() {
  try { for (const line of fs.readFileSync('.env.local', 'utf8').split(/\r?\n/)) { const m = line.match(/^([A-Z0-9_]+)=(.*)$/); if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim() } } catch {}
}
loadEnv()
const port = Number(process.env.PORT || 3001)
const root = path.dirname(fileURLToPath(import.meta.url))
const key = (name) => process.env[`${name}_1`] || process.env[name] || ''
const fetchJson = async (url, options, timeout = 45000) => {
  const controller = new AbortController(); const timer = setTimeout(() => controller.abort(), timeout)
  try { const response = await fetch(url, { ...options, signal: controller.signal }); const data = await response.json(); if (!response.ok) throw new Error(data.error?.message || `HTTP ${response.status}`); return data } finally { clearTimeout(timer) }
}
const json = (res, status, body) => { res.writeHead(status, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type' }); res.end(JSON.stringify(body)) }
const isYoutube = (p) => /youtube|video|watch|tutorial/i.test(p)
const EMERGENCY_TRANSLATOR_CODE = `export default function TranslatorApp(){const [input,setInput]=React.useState('Hello world');const [from,setFrom]=React.useState('en');const [to,setTo]=React.useState('es');const [output,setOutput]=React.useState('');const [search,setSearch]=React.useState('');const [history,setHistory]=React.useState(()=>{try{return JSON.parse(localStorage.getItem('translator_history')||'[]')}catch{return []}});React.useEffect(()=>{try{localStorage.setItem('translator_history',JSON.stringify(history))}catch{}},[history]);const filtered=React.useMemo(()=>history.filter(h=>h.input.toLowerCase().includes(search.toLowerCase())||h.output.toLowerCase().includes(search.toLowerCase())),[history,search]);const total=history.reduce((sum)=>sum+1,0);const translate=()=>{const words={hello:'hola',world:'mundo',good:'bueno',morning:'mañana'};const value=input.toLowerCase().split(' ').map(w=>words[w]||w).join(' ');setOutput(value);setHistory(items=>[{id:Date.now(),input,output:value,from,to},...items].slice(0,30))};const clear=()=>{setHistory([]);setOutput('');try{localStorage.removeItem('translator_history')}catch{}};return <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 p-6"><div className="mx-auto max-w-5xl"><h1 className="mb-2 text-4xl font-bold">🌐 Alpha Translator</h1><p className="mb-6 text-slate-600">{total} translations saved locally</p><div className="grid gap-6 md:grid-cols-2"><section className="rounded-3xl bg-white p-6 shadow-xl"><div className="mb-4 flex gap-3"><select value={from} onChange={e=>setFrom(e.target.value)} className="rounded-full border p-2"><option value="en">English</option><option value="es">Spanish</option></select><select value={to} onChange={e=>setTo(e.target.value)} className="rounded-full border p-2"><option value="es">Spanish</option><option value="en">English</option></select></div><textarea value={input} onChange={e=>setInput(e.target.value)} className="h-36 w-full rounded-2xl border p-4" placeholder="Type text..."/><button onClick={translate} className="mt-4 w-full rounded-full bg-indigo-600 py-3 font-bold text-white">Translate</button></section><section className="rounded-3xl bg-white p-6 shadow-xl"><h2 className="mb-3 text-xl font-bold">Translation</h2><div className="min-h-36 rounded-2xl bg-slate-50 p-4">{output||'Your translation appears here'}</div><button onClick={()=>navigator.clipboard?.writeText(output)} className="mt-4 rounded-full border px-4 py-2">Copy</button><button onClick={clear} className="ml-2 rounded-full bg-red-50 px-4 py-2 text-red-600">Clear</button></section></div><section className="mt-6 rounded-3xl bg-white p-6 shadow-xl"><div className="mb-4 flex items-center justify-between"><h2 className="text-xl font-bold">History</h2><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search history..." className="rounded-full border px-4 py-2"/></div>{filtered.map(item=><div key={item.id} className="flex justify-between border-b py-3"><span>{item.input} → {item.output}</span><button onClick={()=>setHistory(items=>items.filter(x=>x.id!==item.id))} className="text-red-600">Delete</button></div>)}</section></div></div>}`
async function handle(prompt, mode = 'chat') {
  if (isYoutube(prompt) && key('YOUTUBE_API_KEY')) {
    const q = encodeURIComponent(prompt.replace(/youtube|video|watch|tutorial/gi, '').trim() || prompt)
    const data = await (await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=5&q=${q}&key=${key('YOUTUBE_API_KEY')}`)).json()
    const videos = (data.items || []).map((v) => ({ title: v.snippet.title, channel: v.snippet.channelTitle, url: `https://www.youtube.com/watch?v=${v.id.videoId}`, thumbnail: v.snippet.thumbnails?.medium?.url }))
    return { text: videos.length ? `Here are videos I found for “${prompt}”:\n\n${videos.map((v, i) => `${i + 1}. ${v.title} — ${v.url}`).join('\n')}` : 'No YouTube videos were found.', videos }
  }
  if (/(search|latest|news|look up|internet|web)/i.test(prompt) && key('TAVILY_API_KEY')) {
    const data = await (await fetch('https://api.tavily.com/search', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ api_key: key('TAVILY_API_KEY'), query: prompt, search_depth: 'advanced', max_results: 5, include_answer: true }) })).json()
    const sources = (data.results || []).map((r) => `- ${r.title}: ${r.url}`).join('\n')
    return { text: `${data.answer || 'Here is what I found:'}\n\nSources:\n${sources}` }
  }
  const groq = key('GROQ_API_KEY')
  if (groq) {
    const system = mode === 'builder' ? 'You are AlphaTekx Senior Staff Engineer. Output ONLY a fenced tsx code block containing one production React component. No imports. Use real 6-12 item state, useMemo search with toLowerCase includes, Math.max guards, localStorage persistence in try/catch, reduce totals/stats, and real onClick mutations. Build polished 400-700 line apps, never static mockups.' : 'You are AlphaTekx assistant. Answer clearly and helpfully.'
    const data = await fetchJson('https://api.groq.com/openai/v1/chat/completions', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${groq}` }, body: JSON.stringify({ model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile', messages: [{ role: 'system', content: system }, { role: 'user', content: prompt }], temperature: mode === 'builder' ? 0.2 : 0.5, max_tokens: mode === 'builder' ? 8000 : 2000 }) })
    if (data.error) throw new Error(data.error.message || 'Provider error')
    const generated = data.choices?.[0]?.message?.content || ''
    if (mode === 'builder' && !generated.includes('useState')) return { code: EMERGENCY_TRANSLATOR_CODE, response: EMERGENCY_TRANSLATOR_CODE, success: true, fallback: true }
    return mode === 'builder' ? { code: generated } : { text: generated || 'The AI returned no text.' }
  }
  const openai = key('OPENAI_API_KEY')
  if (openai && mode !== 'builder') {
    const data = await fetchJson('https://api.openai.com/v1/chat/completions', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${openai}` }, body: JSON.stringify({ model: process.env.OPENAI_MODEL || 'gpt-4o-mini', messages: [{ role: 'system', content: 'You are Alphatekx, a precise and helpful AI assistant. Explain clearly, use concise structure, and ask a clarifying question only when genuinely needed.' }, { role: 'user', content: prompt }], temperature: 0.5, max_tokens: 2000 }) })
    return { text: data.choices?.[0]?.message?.content || 'The AI returned no text.' }
  }
  if (mode === 'builder') return { code: EMERGENCY_TRANSLATOR_CODE, response: EMERGENCY_TRANSLATOR_CODE, success: true }
  return { text: 'AI is not configured yet. Add a provider key to .env.local, or open Builder to generate a working app locally.' }
}
const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') return json(res, 204, {})
  if (req.method !== 'POST' || req.url !== '/api/alpha') {
    if (req.method !== 'GET') return json(res, 404, { error: 'Not found' })
    const requested = req.url === '/' ? '/index.html' : req.url.split('?')[0]
    const candidate = path.join(root, 'dist', requested)
    const file = fs.existsSync(candidate) && fs.statSync(candidate).isFile() ? candidate : path.join(root, 'dist', 'index.html')
    if (!fs.existsSync(file)) return json(res, 404, { error: 'Build not found. Run npm run build.' })
    const ext = path.extname(file)
    const type = ext === '.js' ? 'text/javascript' : ext === '.css' ? 'text/css' : ext === '.svg' ? 'image/svg+xml' : 'text/html'
    res.writeHead(200, { 'Content-Type': type, 'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=31536000, immutable' })
    return fs.createReadStream(file).pipe(res)
  }
  let raw = ''; req.on('data', (c) => { raw += c }); req.on('end', async () => { let body = {}; try { body = JSON.parse(raw || '{}'); json(res, 200, await handle(String(body.prompt || ''), body.mode)) } catch (e) { console.error('API ALPHA ERROR', e); if (body.mode === 'builder') json(res, 200, { code: EMERGENCY_TRANSLATOR_CODE, response: EMERGENCY_TRANSLATOR_CODE, success: true, fallback: true }); else json(res, 200, { text: 'The AI service is temporarily unavailable.' }) } })
})
server.listen(port, () => console.log(`Alpha API listening on ${port}`))
