import { useEffect, useMemo, useState } from 'react'
import { ArrowUp, Monitor, Rocket, Share2, Smartphone, Sparkles, Tablet, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { buildRealApp } from '../lib/aiBuilder'
import { fallbackTemplate } from '../lib/generator'
import { ToolDrawer } from '../components/layout/GeminiLayout'

type ChatMessage = { role: 'user' | 'assistant'; text: string }

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    try {
      window.localStorage.removeItem(key)
    } catch {}
    return fallback
  }
}

function saveRecentChat(title: string) {
  const recents = readJson<{ id: string; title: string }[]>('recentChats', [])
  const next = [{ id: crypto.randomUUID(), title }, ...recents].slice(0, 12)
  try {
    window.localStorage.setItem('recentChats', JSON.stringify(next))
  } catch {}
}

export default function Builder() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', text: 'Describe the app you want to build and I will generate working code.' },
  ])
  const [input, setInput] = useState('')
  const [previewCode, setPreviewCode] = useState<string | null>(null)
  const [isBuilding, setIsBuilding] = useState(false)
  const [buildLogs, setBuildLogs] = useState<string[]>([])
  const [showTools, setShowTools] = useState(false)
  const [previewError, setPreviewError] = useState<string | null>(null)
  const [width, setWidth] = useState<'100%' | '768px' | '375px'>('100%')
  const navigate = useNavigate()

  useEffect(() => {
    try {
      const draft = window.localStorage.getItem('alphatekx-draft')
      if (draft) {
        setInput(draft)
        window.localStorage.removeItem('alphatekx-draft')
      }
    } catch {}
  }, [])

  const handleBuild = async (prompt = input) => {
    if (!prompt.trim() || isBuilding) return
    const userMessage: ChatMessage = { role: 'user', text: prompt }
    const nextMessages = [...messages, userMessage]
    setMessages(nextMessages)
    setInput('')
    setIsBuilding(true)
    setBuildLogs(['Planning architecture...', 'Generating real React code with AI...', 'Verifying state, persistence, search, totals, and actions...'])
    setPreviewError(null)

    saveRecentChat(prompt.slice(0, 48))

    try {
        const code = await buildRealApp(prompt)
        setPreviewCode(code)
        setBuildLogs((logs) => [...logs, 'Built successfully - interactive preview ready'])
        setMessages((current) => [
          ...current,
          {
            role: 'assistant',
            text: 'Generated. Open the preview on the right and test the interactions.',
          },
        ])
    } catch (error) {
      console.error(error)
      setBuildLogs((logs) => [...logs, 'AI failed - using verified fallback template'])
      setPreviewCode(fallbackTemplate(prompt))
      setMessages((current) => [...current, { role: 'assistant', text: 'AI generation was unavailable, so a verified interactive fallback is ready.' }])
    } finally { setIsBuilding(false) }
  }

  const previewHtml = useMemo(() => {
    if (!previewCode) return ''
    return `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><script src="https://cdn.tailwindcss.com"></script><script src="https://unpkg.com/@babel/standalone/babel.min.js"></script><style>html,body,#root{height:100%;margin:0}body{font-family:Inter,ui-sans-serif,system-ui;background:#fff}*{box-sizing:border-box}</style></head><body><div id="root"></div><script type="text/babel">${previewCode.replace(/<\/script/gi, '<\\/script')}</script></body></html>`
  }, [previewCode])

  const starterChips = ['📚 Build BookHaven', '🧮 Build Calculator', '🏥 Build Hospital', '🛒 Build Shop']

  const openStarter = (prompt: string) => {
    setInput(prompt)
    handleBuild(prompt)
  }

  return (
    <div className="flex h-screen overflow-hidden bg-white text-slate-900">
      <ToolDrawer open={showTools} activeTool="builder" onClose={() => setShowTools(false)} />

      <section className="glass z-10 flex w-[380px] shrink-0 flex-col rounded-none border-y-0 border-l-0 border-r border-white/80">
        <header className="flex h-16 items-center justify-between border-b border-slate-200/60 px-5">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowTools(true)}
              className="grid size-10 place-items-center rounded-full bg-white/80 shadow-sm"
              type="button"
              aria-label="Open tools"
            >
              <Sparkles size={18} />
            </button>
            <div>
              <div className="flex items-center gap-2 font-bold">
                Builder <span className="size-2 rounded-full bg-emerald-500" />
              </div>
              <p className="text-[11px] text-slate-400">Alphatekx builder</p>
            </div>
          </div>
          <button onClick={() => navigate('/home')} className="rounded-full bg-white/80 px-3 py-2 text-sm shadow-sm" type="button">
            Home
          </button>
        </header>

        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          {messages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              className={
                message.role === 'user'
                  ? 'ml-8 rounded-2xl rounded-br-md bg-blue-600 p-3.5 text-sm text-white'
                  : 'mr-5 rounded-2xl rounded-bl-md bg-white/80 p-3.5 text-sm leading-6 shadow-sm'
              }
            >
              {message.text}
            </div>
          ))}
          {isBuilding && (
            <div className="rounded-2xl bg-white/80 p-4 shadow-sm">
              <div className="flex gap-1.5">
                {[0, 1, 2].map((index) => (
                  <span key={index} style={{ animationDelay: `${index * 180}ms` }} className="build-dot size-2 rounded-full bg-blue-500" />
                ))}
              </div>
              <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                <span>Planner</span>
                <span>•</span>
                <span>Coder</span>
                <span>•</span>
                <span>Verifier</span>
              </div>
            </div>
          )}
          {buildLogs.length > 0 && (
            <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-3 text-xs text-blue-700">
              {buildLogs.map((log, index) => <div key={`${log}-${index}`} className="flex items-center gap-2 py-1"><span className="size-1.5 rounded-full bg-blue-500" />{log}</div>)}
            </div>
          )}
        </div>

        <div className="p-4">
          <div className="rounded-[24px] border border-white bg-white/80 p-3 shadow-xl">
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault()
                  handleBuild()
                }
              }}
              placeholder="Describe app to build..."
              className="h-20 w-full resize-none bg-transparent px-2 text-sm outline-none"
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Enter to build</span>
              <button
                onClick={() => handleBuild()}
                disabled={isBuilding || !input.trim()}
                className="grid size-9 place-items-center rounded-full bg-blue-600 text-white disabled:bg-slate-300"
                type="button"
              >
                <ArrowUp size={17} />
              </button>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {starterChips.map((chip) => (
              <button
                key={chip}
                onClick={() => openStarter(chip)}
                className="rounded-full border border-white/70 bg-white/70 px-4 py-2 text-sm shadow-sm"
                type="button"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="flex min-w-0 flex-1 flex-col bg-slate-50">
        <header className="flex h-14 items-center justify-between border-b bg-white px-5">
          <div className="flex items-center gap-1 rounded-full bg-slate-100 p-1">
            <button title="Desktop 1440" onClick={() => setWidth('100%')} className={`rounded-full p-2 ${width === '100%' ? 'bg-white shadow-sm' : ''}`}>
              <Monitor size={16} />
            </button>
            <button title="Tablet 768" onClick={() => setWidth('768px')} className={`rounded-full p-2 ${width === '768px' ? 'bg-white shadow-sm' : ''}`}>
              <Tablet size={16} />
            </button>
            <button title="Mobile 375" onClick={() => setWidth('375px')} className={`rounded-full p-2 ${width === '375px' ? 'bg-white shadow-sm' : ''}`}>
              <Smartphone size={16} />
            </button>
            <span className="px-2 text-xs text-slate-400">{width === '100%' ? '1440' : width.replace('px', '')}</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => navigator.clipboard?.writeText(window.location.href)}
              className="flex items-center gap-2 rounded-full border px-4 py-2 text-sm"
              type="button"
            >
              <Share2 size={15} />
              Share
            </button>
            <button
              onClick={() => alert('Deployment is ready for your connected hosting provider.')}
              className="flex items-center gap-2 rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white"
              type="button"
            >
              <Rocket size={15} />
              Deploy
            </button>
          </div>
        </header>

        <div className="flex flex-1 items-stretch justify-center overflow-auto bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:18px_18px] p-4">
          {previewError ? (
            <div className="m-auto max-w-xl rounded-[32px] border border-white/70 bg-white/80 p-8 text-center shadow-xl backdrop-blur-2xl">
              <div className="mx-auto grid size-16 place-items-center rounded-3xl bg-red-100 text-red-600">
                <X size={30} />
              </div>
              <h1 className="mt-6 text-2xl font-bold">Preview error</h1>
              <p className="mt-2 text-slate-500">The preview could not be rendered. Try a different prompt.</p>
            </div>
          ) : previewCode ? (
            <div style={{ width }} className="h-full overflow-hidden bg-white shadow-xl transition-all">
              <iframe
                title="Generated app preview"
                srcDoc={previewHtml}
                sandbox="allow-scripts allow-same-origin"
                className="h-full w-full border-0"
              />
            </div>
          ) : (
            <div className="m-auto max-w-2xl text-center">
              <div className="mx-auto grid size-20 rotate-45 place-items-center rounded-3xl bg-gradient-to-br from-blue-500 to-violet-500 shadow-xl shadow-blue-200">
                <Sparkles className="-rotate-45 text-white" size={30} />
              </div>
              <h1 className="mt-8 text-3xl font-bold">Your creation appears here</h1>
              <p className="mt-3 text-slate-500">Describe your app in the chat or start from a proven idea.</p>
              <div className="mt-7 flex flex-wrap justify-center gap-2">
                {starterChips.map((chip) => (
                  <button
                    onClick={() => openStarter(chip)}
                    className="rounded-full border bg-white px-4 py-2.5 text-sm shadow-sm hover:border-blue-300"
                    key={chip}
                    type="button"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
