import { supabase } from './supabase'

const KEY = 'alphatekx_credits'
const EVENT = 'alphatekx:credits-change'

export function getCredits() {
  const parsed = Number(localStorage.getItem(KEY) ?? '100')
  return Number.isFinite(parsed) ? parsed : 100
}

export async function spendCredits(amount: number) {
  const current = getCredits()
  if (current < amount) return false
  if (supabase) {
    const { data, error } = await supabase.rpc('spend_credits', { amount })
    if (error || typeof data !== 'number') return false
    setCredits(data)
    return true
  }
  setCredits(current - amount)
  return true
}

export function addCredits(amount: number) { setCredits(getCredits() + amount) }
export function setCredits(credits: number) { localStorage.setItem(KEY, String(Math.max(0, credits))); window.dispatchEvent(new Event(EVENT)) }

export async function hydrateCredits() {
  if (!supabase) return getCredits()
  const { data: auth } = await supabase.auth.getUser()
  if (!auth.user) return getCredits()
  const { data } = await supabase.from('profiles').select('credits').eq('id', auth.user.id).maybeSingle()
  if (data) { setCredits(Number(data.credits)); return Number(data.credits) }
  return getCredits()
}

export function subscribeCredits(listener: () => void) { window.addEventListener(EVENT, listener); return () => window.removeEventListener(EVENT, listener) }
