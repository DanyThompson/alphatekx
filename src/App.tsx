import { Navigate, Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Builder from './pages/Builder'

function PlaceholderPage({ label }: { label: string }) {
  return (
    <div className="flex h-screen items-center justify-center p-6">
      <div className="glass max-w-md rounded-[28px] p-8 text-center">
        <h1 className="text-2xl font-bold text-slate-900">{label}</h1>
        <p className="mt-3 text-slate-500">This tool is a placeholder for now.</p>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/home" replace />} />
      <Route path="/home" element={<Home />} />
      <Route path="/builder" element={<Builder />} />
      <Route path="/writer" element={<PlaceholderPage label="Writer" />} />
      <Route path="/coder" element={<PlaceholderPage label="Coder" />} />
      <Route path="/image" element={<PlaceholderPage label="Image" />} />
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  )
}
