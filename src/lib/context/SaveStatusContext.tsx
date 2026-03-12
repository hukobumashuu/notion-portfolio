'use client'

import { createContext, useContext, useState, useCallback, useRef } from 'react'
import type { SaveStatus } from '@/hooks/useAutoSave'

interface SaveStatusContextValue {
  status: SaveStatus
  triggerSave: (saveFn: () => Promise<void>) => void
}

const SaveStatusContext = createContext<SaveStatusContextValue | null>(null)

export function SaveStatusProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<SaveStatus>('idle')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const triggerSave = useCallback((saveFn: () => Promise<void>) => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    setStatus('saving')

    debounceRef.current = setTimeout(async () => {
      try {
        await saveFn()
        setStatus('saved')
        if (timerRef.current) clearTimeout(timerRef.current)
        timerRef.current = setTimeout(() => setStatus('idle'), 2500)
      } catch {
        setStatus('error')
      }
    }, 800)
  }, [])

  return (
    <SaveStatusContext.Provider value={{ status, triggerSave }}>
      {children}
    </SaveStatusContext.Provider>
  )
}

export function useSaveStatus() {
  const ctx = useContext(SaveStatusContext)
  if (!ctx) throw new Error('useSaveStatus must be used within SaveStatusProvider')
  return ctx
}
