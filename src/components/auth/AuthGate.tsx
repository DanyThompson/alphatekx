import type { PropsWithChildren } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../lib/auth'

export default function AuthGate({ children }: PropsWithChildren) {
  const { user, loading, configured } = useAuth()
  const location = useLocation()
  if (loading) return <div className="grid min-h-screen place-items-center bg-[#060607] text-white"><div className="w-full max-w-sm animate-pulse space-y-3 px-5"><div className="mx-auto size-12 rounded-full bg-white/10"/><div className="h-5 rounded bg-white/10"/><div className="h-12 rounded-xl bg-white/[.06]"/></div></div>
  if (!configured) return <div className="grid min-h-screen place-items-center bg-[#060607] p-6 text-center text-white"><div className="max-w-lg"><h1 className="text-3xl font-semibold">Connect Supabase</h1><p className="mt-4 text-zinc-400">Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable secure AlphaTekX accounts.</p></div></div>
  if (!user) return <Navigate to="/" replace state={{ from: location.pathname + location.search }} />
  return children
}
