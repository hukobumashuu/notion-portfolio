interface TagPillProps {
  label: string
  color?: string
}

export function TagPill({ label, color }: TagPillProps) {
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium text-white/90 transition-opacity"
      style={{ backgroundColor: color ?? '#374151' }}
    >
      {label}
    </span>
  )
}
