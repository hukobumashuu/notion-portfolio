interface TagPillProps {
  label: string
  color?: string // hex color string from DB e.g. '#8B5CF6'
}

export function TagPill({ label, color }: TagPillProps) {
  return (
    <span
      className="inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-medium text-white"
      style={color ? { backgroundColor: color } : undefined}
    >
      {label}
    </span>
  )
}
