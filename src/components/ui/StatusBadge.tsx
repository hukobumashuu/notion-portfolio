const STATUS_STYLES: Record<string, string> = {
  Done: 'bg-surface-border text-text-muted',
  'In Progress': 'bg-amber-portfolio/20 text-amber-portfolio',
}

interface StatusBadgeProps {
  status: string | null
}

export function StatusBadge({ status }: StatusBadgeProps) {
  if (!status) return null

  const style = STATUS_STYLES[status] ?? 'bg-surface-border text-text-muted'

  return (
    <span
      className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-medium ${style}`}
    >
      {status}
    </span>
  )
}
