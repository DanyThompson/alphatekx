import { useEffect, useMemo, useState } from 'react'
import { Bot, ChevronRight, Plus, X } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { createMission, getMissions, hydrateMissionStore, subscribeStore } from '../lib/missionStore'
import type { Mission, WorkerRole } from '../lib/types'
import { createWorker, getWorkers, hydrateWorkers, subscribeWorkers } from '../lib/workerStore'

export default function Home() {
  const [missions, setMissions] = useState<Mission[]>(getMissions())
  const [workers, setWorkers] = useState(getWorkers())
  const [showMission, setShowMission] = useState(false)
  const [showWorker, setShowWorker] = useState(false)
  const [showHelpers, setShowHelpers] = useState(false)
  const [goal, setGoal] = useState('')
  const [worker, setWorker] = useState({ name: '', role: 'coding' as WorkerRole, purpose: '', instructions: '' })
  const [loading, setLoading] = useState(true)
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const query = searchParams.get('q')?.toLowerCase() ?? ''
  const visibleMissions = useMemo(() => missions.filter(mission => !query || mission.title.toLowerCase().includes(query) || mission.goal.toLowerCase().includes(query)), [missions, query])

  useEffect(() => subscribeStore(() => setMissions(getMissions())), [])
  useEffect(() => subscribeWorkers(() => setWorkers(getWorkers())), [])
  useEffect(() => { Promise.all([hydrateMissionStore(), hydrateWorkers()]).finally(() => setLoading(false)) }, [])
  useEffect(() => {
    if (searchParams.get('new') === '1') {
      setShowMission(true)
      try { const draft = localStorage.getItem('alphatekx-draft'); if (draft) { setGoal(draft); localStorage.removeItem('alphatekx-draft') } } catch {}
    }
  }, [searchParams])

  const closeMission = () => { setShowMission(false); if (searchParams.has('new')) { searchParams.delete('new'); setSearchParams(searchParams, { replace: true }) } }
  const submitMission = () => { if (!goal.trim()) return; const mission = createMission(goal); navigate(`/mission/${mission.id}`) }
  const submitWorker = () => { if (!worker.name.trim() || !worker.purpose.trim()) return; createWorker(worker); setShowWorker(false); setWorker({ name: '', role: 'coding', purpose: '', instructions: '' }) }

  if (loading) return <div className="min-h-screen px-5 py-10 md:px-10"><div className="mx-auto max-w-5xl animate-pulse"><div className="h-7 w-64 rounded bg-gray-200"/><div className="mt-6 h-32 rounded-xl bg-gray-200"/><div className="mt-10 space-y-3">{[1,2,3].map(item => <div key={item} className="h-24 rounded-xl bg-gray-200"/>)}</div></div></div>

  return <div className="min-h-[calc(100vh-64px)] px-5 py-8 md:px-10 md:py-10">
    <div className="mx-auto max-w-5xl">
      <section>
        <h1 className="text-xl font-semibold md:text-2xl">What do you want to build today?</h1>
        <p className="mt-2 text-sm text-gray-500">Describe an app, website, lesson, or business idea.</p>
        <div className="mt-5 rounded-xl border border-gray-200 bg-white p-3 shadow-sm focus-within:border-gray-400">
          <textarea value={goal} onChange={event => setGoal(event.target.value)} onKeyDown={event => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); submitMission() } }} className="h-24 w-full resize-none px-2 py-2 text-base outline-none" placeholder="Build a school website, Learn React, Create a store..."/>
          <div className="flex justify-end"><button onClick={submitMission} disabled={!goal.trim()} className="min-h-11 rounded-lg bg-black px-5 text-sm font-medium text-white disabled:opacity-40" type="button">Start</button></div>
        </div>
      </section>

      <section className="mt-10">
        <div className="flex items-center justify-between"><div><h2 className="text-xl font-semibold">Recent missions</h2>{query && <p className="mt-1 text-sm text-gray-500">Results for “{query}”</p>}</div><button onClick={() => setShowMission(true)} className="flex min-h-11 items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 text-sm font-medium" type="button"><Plus size={16}/>New mission</button></div>
        {visibleMissions.length ? <div className="mt-5 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">{visibleMissions.map((mission, index) => <button key={mission.id} onClick={() => navigate(`/mission/${mission.id}`)} className={`flex min-h-24 w-full items-center gap-4 px-5 py-4 text-left hover:bg-gray-50 ${index ? 'border-t border-gray-200' : ''}`} type="button"><div className="min-w-0 flex-1"><div className="flex items-center gap-3"><h3 className="truncate text-sm font-semibold">{mission.title}</h3><span className="text-xs capitalize text-gray-400">{mission.status}</span></div><p className="mt-1 truncate text-sm text-gray-500">{mission.goal}</p><div className="mt-3 h-1 overflow-hidden rounded-full bg-gray-100"><div className="h-full rounded-full bg-black" style={{ width: `${mission.progress}%` }}/></div></div><div className="shrink-0 text-right"><p className="text-xs text-gray-400">{timeAgo(mission.createdAt)}</p><ChevronRight className="ml-auto mt-2 text-gray-400" size={17}/></div></button>)}</div> : <button onClick={() => setShowMission(true)} className="mt-5 grid min-h-56 w-full place-items-center rounded-xl border border-dashed border-gray-300 bg-white p-6 text-center" type="button"><span><span className="mx-auto grid size-11 place-items-center rounded-full bg-gray-100"><Plus size={18}/></span><strong className="mt-4 block text-sm">No missions yet</strong><span className="mt-2 block text-sm text-gray-500">Describe your idea above to start.</span></span></button>}
      </section>

      <section className="mt-8 rounded-xl border border-gray-200 bg-white p-5 shadow-sm"><button onClick={() => setShowHelpers(value => !value)} className="flex min-h-11 w-full items-center justify-between text-left" type="button"><span><strong className="block text-sm">AI helpers</strong><span className="mt-1 block text-sm text-gray-500">Specialists you can mention in a mission.</span></span><span className="text-sm text-gray-500">{workers.length} {showHelpers ? 'Hide' : 'Manage'}</span></button>{showHelpers && <div className="mt-4 border-t border-gray-200 pt-4"><div className="flex flex-wrap gap-2">{workers.map(item => <span key={item.id} className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-gray-100 px-3 text-sm"><Bot size={15}/>@{item.name.replace(/\s+/g, '')}</span>)}<button onClick={() => setShowWorker(true)} className="min-h-10 rounded-lg border border-gray-300 px-3 text-sm" type="button">Add helper</button></div></div>}</section>
    </div>

    {showMission && <Modal title="New mission" onClose={closeMission}><textarea autoFocus value={goal} onChange={event => setGoal(event.target.value)} className="h-36 w-full resize-none rounded-xl border border-gray-300 p-4 outline-none focus:border-gray-500" placeholder="What do you want to build or learn?"/><button onClick={submitMission} disabled={!goal.trim()} className="mt-4 min-h-12 w-full rounded-lg bg-black font-medium text-white disabled:opacity-40">Create mission</button></Modal>}
    {showWorker && <Modal title="New AI helper" onClose={() => setShowWorker(false)}><div className="space-y-3"><input value={worker.name} onChange={event => setWorker({ ...worker, name: event.target.value })} className="field" placeholder="Marketing Assistant"/><select value={worker.role} onChange={event => setWorker({ ...worker, role: event.target.value as WorkerRole })} className="field">{['marketing','coding','support','sales','research','business'].map(role => <option key={role}>{role}</option>)}</select><input value={worker.purpose} onChange={event => setWorker({ ...worker, purpose: event.target.value })} className="field" placeholder="What should this helper do?"/><textarea value={worker.instructions} onChange={event => setWorker({ ...worker, instructions: event.target.value })} className="h-24 w-full resize-none rounded-xl border border-gray-300 p-4 outline-none" placeholder="Optional instructions"/></div><button onClick={submitWorker} className="mt-4 min-h-12 w-full rounded-lg bg-black font-medium text-white">Create helper</button></Modal>}
  </div>
}

function timeAgo(value: string) { const seconds = Math.max(1, Math.floor((Date.now() - new Date(value).getTime()) / 1000)); if (seconds < 60) return 'Just now'; const minutes = Math.floor(seconds / 60); if (minutes < 60) return `${minutes}m ago`; const hours = Math.floor(minutes / 60); if (hours < 24) return `${hours}h ago`; return `${Math.floor(hours / 24)}d ago` }
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) { return <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4" onMouseDown={onClose}><div className="w-full max-w-xl rounded-xl border border-gray-200 bg-white p-6 shadow-sm" onMouseDown={event => event.stopPropagation()}><div className="mb-5 flex items-center justify-between"><h2 className="text-xl font-semibold">{title}</h2><button onClick={onClose} className="grid size-11 place-items-center rounded-lg hover:bg-gray-50" aria-label="Close"><X size={18}/></button></div>{children}</div></div> }
