const STATUS_CONFIG: Record<string, { color: string; dot: string }> = {
  Done: {
    color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    dot: 'bg-emerald-400',
  },
  'In Progress': {
    color: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
    dot: 'bg-amber-400',
  },
  'On Hold': {
    color: 'text-text-muted bg-surface-border/30 border-surface-border',
    dot: 'bg-text-muted',
  },
  Archived: {
    color: 'text-text-muted bg-surface-border/30 border-surface-border',
    dot: 'bg-text-muted',
  },
}

// ✅ FIX 3: Defined a hardcoded fallback so TypeScript knows it can never be undefined
const FALLBACK_CONFIG = {
  color: 'text-text-muted bg-surface-border/30 border-surface-border',
  dot: 'bg-text-muted',
}

export function StatusBadge({ status }: { status: string | null }) {
  if (!status) return null

  const config = STATUS_CONFIG[status] ?? FALLBACK_CONFIG

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium ${config.color}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      {status}
    </span>
  )
}
