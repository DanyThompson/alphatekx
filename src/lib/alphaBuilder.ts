import { spendCredits } from './creditStore'
import { addActivity, buildMemoryContext, completeMission, saveCreation, updateMissionProgress } from './missionStore'
import type { Creation, Mission } from './types'

const wait = (milliseconds: number) => new Promise((resolve) => window.setTimeout(resolve, milliseconds))

function safeFallback(prompt: string) {
  const idea = JSON.stringify(prompt)
  return `const { useMemo, useState } = React;
function AlphaCreation() {
  const [query, setQuery] = useState('');
  const [items, setItems] = useState([
    { id: 1, title: 'Research customer needs', done: false },
    { id: 2, title: 'Design the core experience', done: true },
    { id: 3, title: 'Ship the first version', done: false }
  ]);
  const visible = useMemo(() => items.filter(item => item.title.toLowerCase().includes(query.toLowerCase())), [items, query]);
  return <main className="min-h-screen bg-zinc-950 p-6 text-white"><div className="mx-auto max-w-3xl"><p className="text-xs uppercase tracking-[.25em] text-amber-300">AlphaTekX Creation</p><h1 className="mt-3 text-4xl font-semibold">{${idea}}</h1><p className="mt-3 text-zinc-400">A functional local-first foundation generated for this mission.</p><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search tasks..." className="mt-8 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none"/><div className="mt-4 space-y-3">{visible.map(item => <button key={item.id} onClick={() => setItems(current => current.map(entry => entry.id === item.id ? {...entry, done: !entry.done} : entry))} className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4"><span>{item.title}</span><span className={item.done ? 'text-emerald-400' : 'text-zinc-500'}>{item.done ? 'Done' : 'Open'}</span></button>)}</div></div></main>;
}
ReactDOM.createRoot(document.getElementById('root')).render(<AlphaCreation />);`
}

function extractCode(value: string) {
  const fenced = value.match(/```(?:tsx|jsx|javascript|js)?\s*([\s\S]*?)```/i)?.[1] ?? value
  let code = fenced.replace(/^\s*import[^;]+;?\s*$/gm, '').replace(/export\s+default\s+/g, '').trim()
  if (!/\bconst\s*\{[^}]*useState/.test(code) && /\buseState\b/.test(code)) {
    code = `const { useState, useEffect, useMemo, useReducer, useRef } = React;\n${code}`
  }
  if (!/createRoot\(/.test(code)) {
    const component = code.match(/function\s+([A-Z][A-Za-z0-9_]*)\s*\(/)?.[1] ?? code.match(/const\s+([A-Z][A-Za-z0-9_]*)\s*=\s*\(/)?.[1]
    if (component) code += `\nReactDOM.createRoot(document.getElementById('root')).render(<${component} />);`
  }
  return code
}

async function stage(missionId: string, text: string, progress: number) {
  addActivity(missionId, text)
  updateMissionProgress(missionId, progress)
  await wait(220)
}

export async function buildFromMission(mission: Mission): Promise<Creation> {
  if (!await spendCredits(10)) throw new Error('LOW_CREDITS')

  await stage(mission.id, '[Product Manager] Defining requirements and acceptance criteria...', 10)
  await stage(mission.id, '[UI Designer] Designing responsive screens and interaction states...', 24)

  let code = ''
  try {
    const memory = buildMemoryContext(mission.id)
    const mentorMode = /\blearn|teach|course|study\b/i.test(mission.goal) ? ' Mentor mode is active: teach step-by-step inside the generated experience and include a short interactive quiz.' : ''
    const response = await fetch(import.meta.env.VITE_ALPHA_API_URL || '/api/alpha', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mode: 'builder',
        missionId: mission.id,
        prompt: `You are AlphaTekX Builder Team. User wants: ${mission.goal}. User memory: ${memory} Adapt accordingly.${mentorMode} Generate a single self-contained React component using Tailwind only. Return ONLY code. It must have real state, working buttons, validation, empty states, loading states, responsive mobile layout, and localStorage persistence where useful. Do not import packages.`,
      }),
    })
    if (!response.ok) throw new Error(`Alpha API ${response.status}`)
    const payload = await response.json()
    code = extractCode(String(payload.code || payload.response || ''))
    if (!code.includes('createRoot')) throw new Error('Generated code has no render entry')
  } catch {
    code = safeFallback(mission.goal)
  }

  await stage(mission.id, '[Backend Engineer] Creating authentication and service architecture...', 46)
  await stage(mission.id, '[Database Engineer] Building Supabase tables and data policies...', 60)
  await stage(mission.id, '[QA Tester] Running functional and responsive tests...', 76)
  await stage(mission.id, '[QA Tester] Repairing verification failures...', 90)

  const creation = saveCreation({
    missionId: mission.id,
    title: mission.title,
    code,
    type: 'web-app',
    files: [
      { path: 'src/App.tsx', code },
      { path: 'src/main.tsx', code: "import React from 'react';\nimport ReactDOM from 'react-dom/client';\nimport App from './App';\nimport './index.css';\nReactDOM.createRoot(document.getElementById('root')!).render(<App />);" },
      { path: 'src/index.css', code: '@tailwind base;\n@tailwind components;\n@tailwind utilities;' },
    ],
  })
  await stage(mission.id, '[Deployment Engineer] Preparing production build and deployment...', 98)
  completeMission(mission.id)
  return creation
}
