import { create } from 'zustand'
import { generateApp } from '../lib/generator'

export type BuilderMessage = { id: number; role: 'user' | 'assistant'; text: string }

type BuilderState = {
  previewCode: string | null
  isBuilding: boolean
  messages: BuilderMessage[]
  generate: (prompt: string) => Promise<void>
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

export const useBuilderStore = create<BuilderState>((set) => ({
  previewCode: null,
  isBuilding: false,
  messages: [
    {
      id: 1,
      role: 'assistant',
      text: "Tell me what you want to build. I'll plan it, code it, and verify the result.",
    },
  ],
  generate: async (prompt) => {
    if (!prompt.trim()) return

    set((state) => ({
      isBuilding: true,
      messages: [...state.messages, { id: Date.now(), role: 'user', text: prompt }],
    }))

    await new Promise((resolve) => setTimeout(resolve, 1200))

    const previewCode = generateApp(prompt)

    set((state) => ({
      previewCode,
      isBuilding: false,
      messages: [
        ...state.messages,
        {
          id: Date.now() + 1,
          role: 'assistant',
          text: 'Your application is ready. The preview is fully interactive - try searching, adding items, and using the controls.',
        },
      ],
    }))

    const recents = readJson<string[]>('alphatekx-recents', [])
    try {
      window.localStorage.setItem('alphatekx-recents', JSON.stringify([...recents, prompt]))
    } catch {}
  },
}))
