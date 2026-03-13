'use client'

import { useState } from 'react'
import { addProject } from '@/lib/supabase/mutations'
import { useRouter } from 'next/navigation'

interface AddProjectCardProps {
  collectionId: string
  position: number
}

export function AddProjectCard({ collectionId, position }: AddProjectCardProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  async function handleAdd() {
    setIsLoading(true)
    try {
      await addProject(collectionId, position)
      router.refresh()
    } catch (err) {
      console.error('Failed to add project:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleAdd}
      disabled={isLoading}
      className="rounded-card border-surface-border text-text-muted hover:border-teal hover:text-teal flex h-full min-h-55 w-full flex-col items-center justify-center gap-2 border border-dashed transition-colors disabled:opacity-50"
    >
      <span className="text-2xl">{isLoading ? '…' : '+'}</span>
      <span className="text-xs font-medium">New project</span>
    </button>
  )
}
