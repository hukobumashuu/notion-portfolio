'use client'

import { useState } from 'react'
import { addCollection } from '@/lib/supabase/mutations'
import { useRouter } from 'next/navigation'

export function AddSectionButton({ position }: { position: number }) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  async function handleAdd() {
    setIsLoading(true)
    try {
      await addCollection(position)
      router.refresh()
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleAdd}
      disabled={isLoading}
      className="text-text-muted hover:text-teal flex items-center gap-2 text-sm transition-colors disabled:opacity-50"
    >
      <span>+</span>
      <span>{isLoading ? 'Adding…' : 'Add section'}</span>
    </button>
  )
}
