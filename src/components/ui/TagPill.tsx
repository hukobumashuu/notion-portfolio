import { cn } from '@/lib/utils'

interface TagPillProps {
  label: string
  color?: string
}

export function TagPill({ label, color }: TagPillProps) {
  // Use the database hex color for the background tint. If undefined, fallback to Notion's default gray
  const bgColor = color ? `${color}33` : 'rgba(255,255,255,0.055)'

  return (
    <div
      className={cn(
        'm-0 flex h-5 max-w-full min-w-0 shrink-0 items-center overflow-hidden rounded-[3px] px-1.5 text-[12px] leading-4.5 whitespace-nowrap text-white',
      )}
      style={{
        backgroundColor: bgColor,
      }}
    >
      <span className="inline-flex h-5 items-center overflow-hidden leading-4.5 text-ellipsis whitespace-nowrap">
        {label}
      </span>
    </div>
  )
}
