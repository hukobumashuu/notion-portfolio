import Link from 'next/link'
import { SaveIndicator } from './SaveIndicator'
import type { SaveStatus } from '@/hooks/useAutoSave'

interface EditorToolbarProps {
  saveStatus: SaveStatus
}

export function EditorToolbar({ saveStatus }: EditorToolbarProps) {
  return (
    <div className="border-surface-border bg-surface-card/90 fixed top-0 right-0 left-0 z-40 flex h-10 items-center justify-between border-b px-6 backdrop-blur-sm">
      <div className="flex items-center gap-2">
        <span className="text-amber-portfolio hidden text-xs font-medium sm:inline">✎ Editing</span>
        <span className="text-amber-portfolio text-xs font-medium sm:hidden">✎</span>
        <SaveIndicator status={saveStatus} />
      </div>

      <Link
        href="/"
        target="_blank"
        className="text-text-muted hover:text-text-primary text-xs transition-colors"
      >
        View public ↗
      </Link>
    </div>
  )
}
