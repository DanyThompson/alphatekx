import { useEffect, useState, type PropsWithChildren } from 'react'
import { Boxes, ChevronDown, CircleHelp, LayoutGrid, LogOut, Rocket, Search, Shapes, Sparkles, X } from 'lucide-react'
import { NavLink, useNavigate } from 'react-router-dom'
import { addCredits, getCredits, hydrateCredits, setCredits, subscribeCredits } from '../../lib/creditStore'
import { useAuth } from '../../lib/auth'
import { hydrateMarketplaceStore, hydrateMissionStore } from '../../lib/missionStore'
import { hydrateWorkers } from '../../lib/workerStore'

const navigation = [
  { label: 'Workspace', to: '/workspace', icon: LayoutGrid },
  { label: 'Missions', to: '/workspace', icon: Sparkles },
  { label: 'Creations', to: '/creations', icon: Boxes },
  { label: 'Marketplace', to: '/marketplace', icon: Shapes },
  { label: 'Launch', to: '/launch', icon: Rocket },
]

const onboarding = [
  ['1. Type your idea', 'Describe what you want in simple words.'],
  ['2. Chat with AI', 'Answer questions and shape the result together.'],
  ['3. Publish and launch', 'Review your creation, then share it.'],
]

export default function WorkspaceLayout({ children }: PropsWithChildren) {
  const [credits, updateCredits] = useState(() => getCredits())
  const [showCredits, setShowCredits] = useState(false)
  const [showAccount, setShowAccount] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const [onboardingStep, setOnboardingStep] = useState(() => {
    try { return localStorage.getItem('alphatekx_onboarded') ? -1 : 0 } catch { return 0 }
  })
  const [paymentNotice, setPaymentNotice] = useState('')
  const [search, setSearch] = useState('')
  const { user, profile, refreshProfile, signOut } = useAuth()
  const navigate = useNavigate()

  useEffect(() => subscribeCredits(() => updateCredits(getCredits())), [])
  useEffect(() => { void Promise.all([hydrateMissionStore(), hydrateMarketplaceStore(), hydrateWorkers(), hydrateCredits()]) }, [user?.id])
  useEffect(() => { if (profile) updateCredits(profile.credits) }, [profile])
  useEffect(() => { if (credits < 5) setShowCredits(true) }, [credits])

  const submitSearch = (event: React.FormEvent) => {
    event.preventDefault()
    navigate(search.trim() ? `/workspace?q=${encodeURIComponent(search.trim())}` : '/workspace')
  }
  const finishOnboarding = () => { try { localStorage.setItem('alphatekx_onboarded', '1') } catch {}; setOnboardingStep(-1) }
  const topUp = async (plan: 'starter' | 'pro') => {
    setPaymentNotice('Opening secure checkout...')
    try {
      const { startPaystackCheckout } = await import('../../lib/paystack')
      const result = await startPaystackCheckout(plan, user?.email ?? '')
      if (result.simulated) addCredits(result.credits); else setCredits(result.credits)
      await refreshProfile()
      setPaymentNotice(result.simulated ? 'Development mode: credits added locally.' : 'Payment verified. Credits added.')
    } catch (error) { setPaymentNotice(error instanceof Error ? error.message : 'Payment failed') }
  }

  return <div className="min-h-screen bg-[#FAFAFA] text-[#111111] md:flex">
    <aside className="border-b border-gray-200 bg-white md:sticky md:top-0 md:flex md:h-screen md:w-60 md:shrink-0 md:flex-col md:border-b-0 md:border-r">
      <NavLink to="/workspace" className="flex h-16 items-center px-5 text-sm font-semibold tracking-[0.14em]">ALPHATEKX</NavLink>
      <nav className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-1 md:flex-col md:overflow-visible">
        {navigation.map(({ label, to, icon: Icon }) => <NavLink key={label} to={to} end={label === 'Workspace'} className={({ isActive }) => `flex min-h-11 shrink-0 items-center gap-3 rounded-lg px-3 text-sm transition-colors ${isActive ? 'bg-gray-100 font-medium text-black' : 'text-gray-500 hover:bg-gray-50 hover:text-black'}`}><Icon size={17}/><span>{label}</span></NavLink>)}
      </nav>
    </aside>
    <div className="min-w-0 flex-1">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-gray-200 bg-white/95 px-4 backdrop-blur md:px-6">
        <span className="hidden text-sm font-semibold lg:block">AlphaTekx</span>
        <form onSubmit={submitSearch} className="mx-auto flex h-10 w-full max-w-md items-center gap-2 rounded-lg border border-gray-200 bg-[#FAFAFA] px-3 focus-within:border-gray-400"><Search size={16} className="text-gray-400"/><input value={search} onChange={event => setSearch(event.target.value)} className="min-w-0 flex-1 bg-transparent text-sm outline-none" placeholder="Search missions"/></form>
        <button onClick={() => setShowCredits(true)} className="hidden min-h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm sm:block" type="button">Credits: {credits}</button>
        <div className="relative">
          <button onClick={() => setShowAccount(value => !value)} className="flex min-h-10 items-center gap-2 rounded-lg border border-gray-200 bg-white px-2" type="button"><span className="grid size-7 place-items-center rounded-full bg-black text-xs font-semibold text-white">{user?.email?.[0]?.toUpperCase() ?? 'A'}</span><ChevronDown size={14} className="text-gray-400"/></button>
          {showAccount && <div className="absolute right-0 top-12 w-64 rounded-xl border border-gray-200 bg-white p-2 shadow-sm"><p className="truncate px-3 py-2 text-xs text-gray-500">{user?.email}</p><button onClick={() => setShowCredits(true)} className="flex min-h-10 w-full items-center justify-between rounded-lg px-3 text-sm hover:bg-gray-50" type="button"><span>Credits</span><strong>{credits}</strong></button><NavLink to="/account" className="flex min-h-10 items-center rounded-lg px-3 text-sm hover:bg-gray-50">Account settings</NavLink><button onClick={() => void signOut()} className="flex min-h-10 w-full items-center gap-2 rounded-lg px-3 text-sm hover:bg-gray-50" type="button"><LogOut size={15}/>Sign out</button></div>}
        </div>
      </header>
      <main>{children}</main>
    </div>

    <button onClick={() => setShowHelp(value => !value)} className="fixed bottom-5 right-5 z-40 grid size-12 place-items-center rounded-full border border-gray-200 bg-white shadow-sm" aria-label="Help" type="button"><CircleHelp size={20}/></button>
    {showHelp && <div className="fixed bottom-20 right-5 z-40 w-[calc(100vw-2.5rem)] max-w-xs rounded-xl border border-gray-200 bg-white p-4 shadow-sm"><div className="flex items-center justify-between"><strong className="text-sm">How AlphaTekx works</strong><button onClick={() => setShowHelp(false)} aria-label="Close help"><X size={16}/></button></div><ol className="mt-3 space-y-3 text-sm text-gray-600">{onboarding.map(([title, text]) => <li key={title}><strong className="block text-gray-900">{title}</strong>{text}</li>)}</ol></div>}
    {onboardingStep >= 0 && <div className="fixed inset-0 z-[70] grid place-items-center bg-black/30 p-4"><section className="w-full max-w-sm rounded-xl border border-gray-200 bg-white p-6 shadow-sm"><p className="text-xs font-medium text-gray-500">Getting started {onboardingStep + 1} of 3</p><h2 className="mt-3 text-xl font-semibold">{onboarding[onboardingStep][0]}</h2><p className="mt-2 text-sm leading-6 text-gray-600">{onboarding[onboardingStep][1]}</p><div className="mt-6 flex justify-between"><button onClick={finishOnboarding} className="min-h-11 px-2 text-sm text-gray-500">Skip</button><button onClick={() => onboardingStep === 2 ? finishOnboarding() : setOnboardingStep(onboardingStep + 1)} className="min-h-11 rounded-lg bg-black px-5 text-sm font-medium text-white">{onboardingStep === 2 ? 'Start building' : 'Next'}</button></div></section></div>}
    {showCredits && <div className="fixed inset-0 z-[80] grid place-items-center bg-black/30 p-4" onMouseDown={() => setShowCredits(false)}><section className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-sm" onMouseDown={event => event.stopPropagation()}><div className="flex justify-between"><div><p className="text-sm text-gray-500">Alpha credits</p><h2 className="mt-1 text-xl font-semibold">Keep creating</h2></div><button onClick={() => setShowCredits(false)} className="grid size-11 place-items-center rounded-lg hover:bg-gray-50" type="button"><X size={18}/></button></div><p className="mt-4 text-sm leading-6 text-gray-600">Chats use 1 credit. Full builds use 10 credits.</p>{paymentNotice && <p className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm">{paymentNotice}</p>}<div className="mt-6 grid gap-3"><button onClick={() => void topUp('starter')} className="min-h-12 rounded-lg bg-black font-medium text-white" type="button">NGN 2,000 - 500 credits</button><button onClick={() => void topUp('pro')} className="min-h-12 rounded-lg border border-gray-300 bg-white font-medium" type="button">NGN 8,000 - 2,500 credits + Pro</button></div></section></div>}
  </div>
}
