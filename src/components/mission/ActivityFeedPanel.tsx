import { motion } from 'framer-motion'
import { CheckCircle2, Circle } from 'lucide-react'
import type { Activity } from '../../lib/types'

const simpleText = (value: string) => value
  .replace(/^\[[^\]]+\]\s*/, '')
  .replace(/Preparing (deployment )?artifacts/gi, 'Preparing your app')
  .replace(/orchestrat\w*/gi, 'organizing')

export default function ActivityFeedPanel({ activities, building }: { activities: Activity[]; building: boolean }) {
  return <div className="max-h-64 overflow-y-auto px-5 pb-5">
    <div className="space-y-3 border-l border-gray-200 pl-4">{activities.map(activity => <motion.div key={activity.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .2 }} className="relative"><span className="absolute -left-[21px] top-1 grid size-3 place-items-center rounded-full bg-white"><CheckCircle2 size={13} className="text-gray-500"/></span><p className="text-sm text-gray-700">{simpleText(activity.text)}</p><p className="mt-1 text-xs text-gray-400">{new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p></motion.div>)}</div>
    {building && <div className="mt-4 flex items-center gap-2 text-xs text-gray-500"><Circle className="animate-pulse fill-black text-black" size={8}/>AI team building your app</div>}
  </div>
}
