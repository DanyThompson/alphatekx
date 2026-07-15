import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ChevronDown, Menu, Plus, Sparkles, Wrench, X } from 'lucide-react'

type RecentChat = { id: string; title: string }

type GeminiLayoutProps = {
  children: ReactNode
  activeTool?: 'builder' | 'writer' | 'coder' | 'image'
}

type ToolDrawerProps = {
  open: boolean
  activeTool?: GeminiLayoutProps['activeTool']
  onClose: () => void
}

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function writeJson(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {}
}

export function saveRecentChat(title: string) {
  const recents = readJson<RecentChat[]>('recentChats', [])
  const next = [{ id: crypto.randomUUID(), title }, ...recents].slice(0, 12)
  writeJson('recentChats', next)
  return next[0]
}

export function ToolDrawer({ open, activeTool, onClose }: ToolDrawerProps) {
  const navigate = useNavigate()

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    if (open) window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  const items = [
    {
      id: 'builder',
      icon: Sparkles,
      title: 'Builder',
      description: 'Create apps with real code',
      path: '/builder',
    },
  ] as const

  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-slate-900/20 transition-opacity ${open ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
      />
      <aside
        className={`fixed left-0 top-0 z-50 h-screen w-[320px] border-r border-white/60 bg-white/75 backdrop-blur-3xl shadow-2xl shadow-slate-200/40 transition-transform duration-300 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-white/70 px-5">
          <div className="flex items-center gap-2 font-semibold text-slate-900">
            <Wrench size={18} className="text-blue-600" />
            Tools
          </div>
          <button onClick={onClose} className="rounded-full bg-white/80 p-2 shadow-sm">
            <X size={16} />
          </button>
        </div>
        <div className="border-b border-white/60 p-4">
          <button onClick={() => { navigate('/home'); onClose() }} className="flex w-full items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-semibold shadow-sm" type="button">
            <Plus size={16} /> New chat
          </button>
          <p className="mt-5 px-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Recent chats</p>
          <div className="mt-2 max-h-40 space-y-1 overflow-y-auto">
            {readJson<RecentChat[]>('recentChats', []).slice(0, 6).map((chat) => (
              <button key={chat.id} onClick={() => { navigate(`/home?id=${chat.id}`); onClose() }} className="block w-full truncate rounded-xl px-3 py-2 text-left text-sm hover:bg-white/80" type="button">{chat.title}</button>
            ))}
          </div>
        </div>
        <div className="space-y-2 p-4">
          {items.map((item) => {
            const Icon = item.icon
            const active = activeTool === item.id
            return (
              <button
                key={item.id}
                onClick={() => {
                  navigate(item.path)
                  onClose()
                }}
                className={`flex w-full items-start gap-3 rounded-[18px] border p-3 text-left transition ${
                  active ? 'border-blue-200 bg-blue-50/90 shadow-sm' : 'border-white/70 bg-white/60 hover:bg-white/90'
                }`}
              >
                <div className={`grid size-10 shrink-0 place-items-center rounded-2xl ${active ? 'bg-blue-600 text-white' : 'bg-slate-900 text-white'}`}>
                  <Icon size={18} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900">{item.title}</span>
                    {active && <span className="size-2 rounded-full bg-blue-500" />}
                  </div>
                  <p className="mt-1 text-sm text-slate-500">{item.description}</p>
                </div>
              </button>
            )
          })}
        </div>
      </aside>
    </>
  )
}

export default function GeminiLayout({ children, activeTool }: GeminiLayoutProps) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [recentChats, setRecentChats] = useState<RecentChat[]>([])
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    setRecentChats(readJson<RecentChat[]>('recentChats', []))
  }, [location.pathname])

  const newestChats = useMemo(() => recentChats.slice(0, 8), [recentChats])

  return (
    <div className="relative flex h-screen overflow-hidden bg-[#F8F9FF] text-slate-900">
      <div className="aurora aurora-blue" />
      <div className="aurora aurora-purple" />
      <div className="aurora aurora-cyan" />

      <ToolDrawer open={drawerOpen} activeTool={activeTool} onClose={() => setDrawerOpen(false)} />

      <aside
        className="hidden"
      >
        <div className="flex h-16 items-center px-5">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold">
            <Sparkles className="text-blue-600" />
            <span className="bg-gradient-to-r from-blue-600 via-violet-600 to-cyan-500 bg-clip-text text-transparent">Alphatekx</span>
            <span>✨</span>
          </Link>
        </div>
        <div className="px-4">
          <button
            onClick={() => {
              navigate('/home')
            }}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-semibold shadow-sm"
          >
            <Plus size={16} />
            New chat
          </button>
        </div>
        <div className="mt-8 px-4">
          <p className="px-1 text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Recent chats</p>
          <div className="mt-3 space-y-2">
            {newestChats.length ? (
              newestChats.map((chat) => (
                <Link
                  key={chat.id}
                  to={`/home?id=${chat.id}`}
                  className="block rounded-2xl border border-white/60 bg-white/55 px-4 py-3 text-sm shadow-sm transition hover:bg-white"
                >
                  {chat.title}
                </Link>
              ))
            ) : (
              <p className="rounded-2xl border border-white/60 bg-white/55 px-4 py-3 text-sm text-slate-400">
                Your recent chats will appear here.
              </p>
            )}
          </div>
        </div>
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center gap-3 rounded-full border border-white/60 bg-white/75 p-2 shadow-sm backdrop-blur-2xl">
            <div className="grid size-10 place-items-center rounded-full bg-gradient-to-br from-blue-500 to-violet-500 font-bold text-white">
              A
            </div>
            <div>
              <p className="text-sm font-semibold">Alex Creator</p>
              <p className="text-xs text-slate-500">Free workspace</p>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-white/60 bg-white/75 px-4 backdrop-blur-3xl md:px-6">
          <div className="flex items-center gap-3">
            <button
              aria-label="Open tools"
              onClick={() => setDrawerOpen(true)}
              className="grid size-10 place-items-center rounded-full bg-white/80 shadow-sm"
            >
              <Menu size={20} />
            </button>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-white/70 bg-white/75 px-4 py-2 text-sm shadow-sm">
            <div className="size-2 rounded-full bg-blue-500" />
            <span>Gemini mode</span>
            <ChevronDown size={14} className="text-slate-400" />
          </div>
        </header>
        <main className="min-h-0 flex-1 overflow-hidden">{children}</main>
      </div>
    </div>
  )
}
