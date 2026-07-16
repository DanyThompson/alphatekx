import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowUp, Mic } from 'lucide-react'
import GeminiLayout from '../components/layout/GeminiLayout'
import { useSearchParams } from 'react-router-dom'

type ChatMessage = { role: 'user' | 'ai'; text: string }

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function renderText(text: string) {
  return text.split('\n').map((line, index) => (
    <p key={index} className={index ? 'mt-2' : ''}>
      {line}
    </p>
  ))
}

export default function Home() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [pending, setPending] = useState(false)
  const [searchParams] = useSearchParams()
  const chatIdRef = useRef<string | null>(null)
  useEffect(() => {
    const chatId = searchParams.get('id')
    const chats = readJson<{ id: string; title: string; messages?: ChatMessage[] }[]>('recentChats', [])
    if (chatId) {
      const found = chats.find((chat) => chat.id === chatId)
      if (found?.messages?.length) setMessages(found.messages)
    }
  }, [searchParams])

  const emptyState = messages.length === 0

  const saveChat = (nextMessages: ChatMessage[], title: string) => {
    if (!chatIdRef.current) chatIdRef.current = crypto.randomUUID()
    const recents = readJson<{ id: string; title: string; messages?: ChatMessage[] }[]>('recentChats', [])
    const filtered = recents.filter((chat) => chat.id !== chatIdRef.current)
    const next = [{ id: chatIdRef.current, title, messages: nextMessages }, ...filtered].slice(0, 12)
    try {
      window.localStorage.setItem('recentChats', JSON.stringify(next))
    } catch {}
  }

  const submit = async (prompt = input) => {
    if (!prompt.trim() || pending) return
    const userMessage: ChatMessage = { role: 'user', text: prompt }
    const nextMessages = [...messages, userMessage]
    setMessages(nextMessages)
    setInput('')
    setPending(true)

    const title = prompt.slice(0, 42)
    saveChat(nextMessages, title)

    try {
      const endpoint = import.meta.env.VITE_ALPHA_API_URL || '/api/alpha'
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, messages: nextMessages }),
      })
      if (!response.ok) throw new Error(`API ${response.status}`)
      const payload = await response.json()
      const answer = payload.response || payload.text || payload.message || payload.content || payload.data?.text
      if (!answer) throw new Error('Empty API response')
      const aiMessage: ChatMessage = { role: 'ai', text: String(answer) }
      const finalMessages = [...nextMessages, aiMessage]
      setMessages(finalMessages)
      saveChat(finalMessages, title)
    } catch {
      const fallback: ChatMessage = { role: 'ai', text: 'I could not reach the AI service right now. You can still build a real app by opening the hamburger and choosing Builder.' }
      const finalMessages = [...nextMessages, fallback]
      setMessages(finalMessages)
      saveChat(finalMessages, title)
    } finally { setPending(false) }
  }

  const chips = useMemo(
    () => ['Explain quantum', 'Build a landing page', 'Write a business plan', 'Code a game'],
    [],
  )

  return (
    <GeminiLayout activeTool="builder">
      <div className="flex h-full min-h-0 flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto px-4 py-8">
          {emptyState ? (
            <div className="mx-auto mt-24 max-w-3xl text-center">
              <h1 className="text-[42px] font-bold leading-tight text-slate-900">Hello, what will we build today?</h1>
              <div className="hidden">
                <Languages className="mr-3 text-slate-400" size={18} />
                <input
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && !event.shiftKey) {
                      event.preventDefault()
                      void submit()
                    }
                  }}
                  className="min-w-0 flex-1 bg-transparent text-slate-900 outline-none placeholder:text-slate-400"
                  placeholder="Ask Alphatekx anything..."
                />
                <button className="grid size-10 place-items-center rounded-full bg-slate-100 text-slate-500" type="button">
                  ✨
                </button>
                <button className="ml-2 grid size-10 place-items-center rounded-full bg-slate-100 text-slate-500" type="button">
                  <Mic size={16} />
                </button>
                <button
                  onClick={() => void submit()}
                  className="ml-2 grid size-10 place-items-center rounded-full bg-blue-600 text-white shadow-lg shadow-blue-200"
                  type="button"
                >
                  <ArrowUp size={16} />
                </button>
              </div>
              <div className="hidden">
                {chips.map((chip) => (
                  <button
                    key={chip}
                    onClick={() => void submit(chip)}
                    className="glass rounded-full border border-white/70 bg-white/70 px-4 py-2 text-sm text-slate-700 shadow-sm"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="mx-auto flex max-w-3xl flex-col gap-4">
              {messages.map((message, index) =>
                message.role === 'user' ? (
                  <div key={index} className="ml-auto max-w-[70%] rounded-[24px] rounded-br-md bg-slate-900 px-5 py-3 text-white shadow-sm">
                    {renderText(message.text)}
                  </div>
                ) : (
                  <div key={index} className="mr-auto max-w-[75%] rounded-[24px] rounded-bl-md border border-white/70 bg-white/75 px-5 py-3 text-slate-900 shadow-sm backdrop-blur-2xl">
                    {renderText(message.text)}
                  </div>
                ),
              )}
              {pending && (
                <div className="mr-auto rounded-[24px] rounded-bl-md border border-white/70 bg-white/75 px-5 py-3 text-slate-900 shadow-sm backdrop-blur-2xl">
                  Thinking...
                </div>
              )}
            </div>
          )}
        </div>

        <div className="border-t border-white/60 bg-white/35 px-4 py-4 backdrop-blur-xl">
          <div className="mx-auto flex max-w-3xl items-center gap-2 rounded-full border border-white/70 bg-white/80 px-4 py-3 shadow-lg shadow-slate-200/50">
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault()
                  void submit()
                }
              }}
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
              placeholder="Ask Alphatekx anything..."
            />
            <button className="rounded-full p-2 text-slate-500 hover:bg-white" type="button">
              ✨
            </button>
            <button className="rounded-full p-2 text-slate-500 hover:bg-white" type="button">
              <Mic size={16} />
            </button>
            <button
              onClick={() => void submit()}
              className="grid size-11 place-items-center rounded-full bg-blue-600 text-white shadow-lg shadow-blue-200"
              type="button"
            >
              <ArrowUp size={18} />
            </button>
          </div>
          {emptyState && (
            <div className="mx-auto mt-4 flex max-w-3xl flex-wrap justify-center gap-2">
              {chips.map((chip) => (
                <button
                  key={chip}
                  onClick={() => void submit(chip)}
                  className="glass rounded-full border border-white/70 bg-white/70 px-4 py-2 text-sm text-slate-700 shadow-sm"
                >
                  {chip}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </GeminiLayout>
  )
}
