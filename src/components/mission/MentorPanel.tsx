import { useEffect, useState } from 'react'
import { BookOpen, CheckCircle2 } from 'lucide-react'
import { completeLesson, ensureMentorProgress, hydrateMentor, subscribeMentor } from '../../lib/mentorStore'
import type { Mission } from '../../lib/types'

export default function MentorPanel({ mission }: { mission: Mission }) {
  const [progress, setProgress] = useState(() => ensureMentorProgress(mission.id, mission.goal))
  const [lessonId, setLessonId] = useState(progress.lessons[0]?.id ?? '')
  const [selected, setSelected] = useState<number | null>(null)
  useEffect(() => subscribeMentor(() => setProgress(ensureMentorProgress(mission.id, mission.goal))), [mission.id, mission.goal])
  useEffect(() => { void hydrateMentor(mission.id) }, [mission.id])
  const lesson = progress.lessons.find(item => item.id === lessonId) ?? progress.lessons[0]
  const percent = Math.round(progress.lessonsCompleted.length / Math.max(1, progress.lessons.length) * 100)
  const submit = () => { if (selected === null || !lesson) return; completeLesson(mission.id, lesson.id, selected === lesson.quiz.answer ? 100 : 0) }
  return <div className="border-t border-gray-200 p-5"><div className="flex items-center justify-between"><h3 className="flex items-center gap-2 text-sm font-semibold"><BookOpen size={16}/>Learn {progress.subject}</h3><span className="text-xs text-gray-500">{percent}%</span></div><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-gray-100"><div className="h-full bg-black" style={{ width: `${percent}%` }}/></div><div className="mt-4 flex gap-2 overflow-x-auto">{progress.lessons.map(item => <button key={item.id} onClick={() => { setLessonId(item.id); setSelected(null) }} className={`min-h-10 shrink-0 rounded-lg px-3 text-xs ${item.id === lesson?.id ? 'bg-black text-white' : 'border border-gray-200 bg-white text-gray-600'}`}>{progress.lessonsCompleted.includes(item.id) && <CheckCircle2 className="mr-1 inline" size={13}/>} {item.title}</button>)}</div>{lesson && <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4"><p className="text-sm font-semibold">{lesson.objective}</p><p className="mt-2 text-xs leading-5 text-gray-600">{lesson.explanation}</p><pre className="mt-3 overflow-x-auto rounded-lg bg-[#111] p-3 font-mono text-[11px] text-gray-200">{lesson.codeExample}</pre><p className="mt-4 text-xs font-semibold">{lesson.quiz.question}</p><div className="mt-2 grid gap-2">{lesson.quiz.options.map((option, index) => <button key={option} onClick={() => setSelected(index)} className={`min-h-9 rounded-lg border px-3 text-left text-xs ${selected === index ? 'border-black bg-gray-50 text-black' : 'border-gray-200 text-gray-600'}`}>{option}</button>)}</div><button onClick={submit} disabled={selected === null} className="mt-3 min-h-10 w-full rounded-lg bg-black text-xs font-medium text-white disabled:opacity-40">Check answer</button></div>}</div>
}
