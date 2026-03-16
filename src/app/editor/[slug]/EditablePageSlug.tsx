'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { EditableText } from '@/components/editor/EditableText'
import { updatePageSlug } from '@/lib/supabase/mutations'
import { useSaveStatus } from '@/lib/context/SaveStatusContext'

export function EditablePageSlug({
  currentSlug,
  isProtected,
}: {
  currentSlug: string
  isProtected: boolean
}) {
  const router = useRouter()
  const { triggerSave } = useSaveStatus()
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  function handleSlugSave(newSlug: string) {
    setErrorMsg(null)

    // Quick sanitization for the local UI check
    const sanitized = newSlug
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '')
    if (sanitized === currentSlug) return

    triggerSave(async () => {
      try {
        await updatePageSlug(currentSlug, sanitized)
        // If successful, instantly redirect the user to the new URL!
        router.push(`/editor/${sanitized}`)
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to update URL'
        setErrorMsg(message)
        throw err
      }
    })
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <div className="text-text-muted flex items-center gap-1 font-mono text-sm">
        <span>/</span>
        {isProtected ? (
          <span
            className="flex cursor-not-allowed items-center gap-2 opacity-80"
            title="Core pages cannot change their URLs"
          >
            {currentSlug} <span className="text-[10px]">🔒</span>
          </span>
        ) : (
          <div className="hover:bg-surface-border/30 -ml-1 rounded px-1 transition-colors">
            <EditableText
              as="span"
              value={currentSlug}
              onSave={handleSlugSave}
              isEditing={true}
              singleLine
              className="focus:text-teal transition-colors outline-none"
            />
          </div>
        )}
      </div>
      {errorMsg && <span className="text-xs text-red-400">{errorMsg}</span>}
    </div>
  )
}
