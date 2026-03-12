import { cn } from '@/lib/utils'
import type { SaveStatus } from '@/hooks/useAutoSave'

interface SaveIndicatorProps {
  status: SaveStatus
}

const CONFIG: Record<SaveStatus, { label: string; className: string }> = {
  idle: { label: '', className: 'opacity-0' },
  saving: { label: '↑ Saving…', className: 'text-text-muted' },
  saved: { label: '✓ Saved', className: 'text-teal' },
  error: { label: '✕ Error', className: 'text-red-400' },
}

export function SaveIndicator({ status }: SaveIndicatorProps) {
  const { label, className } = CONFIG[status]

  return (
    <span className={cn('text-xs font-medium transition-opacity duration-300', className)}>
      {label}
    </span>
  )
}
