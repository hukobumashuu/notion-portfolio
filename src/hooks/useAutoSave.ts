import { useState, useCallback, useRef } from 'react'

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

interface UseAutoSaveOptions {
  debounceMs?: number
}

interface UseAutoSaveReturn {
  status: SaveStatus
  save: (saveFn: () => Promise<void>) => void
}

export function useAutoSave({ debounceMs = 800 }: UseAutoSaveOptions = {}): UseAutoSaveReturn {
  const [status, setStatus] = useState<SaveStatus>('idle')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const save = useCallback(
    (saveFn: () => Promise<void>) => {
      // Clear any pending save
      if (timerRef.current) clearTimeout(timerRef.current)

      setStatus('saving')

      timerRef.current = setTimeout(async () => {
        try {
          await saveFn()
          setStatus('saved')

          // Reset to idle after 2.5s so the indicator fades out
          setTimeout(() => setStatus('idle'), 2500)
        } catch {
          setStatus('error')
        }
      }, debounceMs)
    },
    [debounceMs],
  )

  return { status, save }
}
