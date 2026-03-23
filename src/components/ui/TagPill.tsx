import { cn } from '@/lib/utils'

interface TagPillProps {
  label: string
  color?: string
  size?: 'sm' | 'md' // 🟢 Added size prop
}

export function TagPill({ label, color, size = 'sm' }: TagPillProps) {
  // Use the database hex color for the background tint. If undefined, fallback to Notion's default gray
  const bgColor = color ? `${color}33` : 'rgba(255,255,255,0.055)'

  const isMd = size === 'md'

  return (
    <div
      className={cn(
        'm-0 flex max-w-full min-w-0 shrink-0 items-center overflow-hidden whitespace-nowrap text-white',
        // 🟢 Switch geometries based on size
        isMd
          ? 'h-6 rounded-sm px-2 text-[16px] leading-6' // Larger for Modal
          : 'h-5 rounded-[3px] px-1.5 text-[14px] leading-4.5', // Small for Project Card
      )}
      style={{
        backgroundColor: bgColor,
      }}
    >
      <span
        className={cn(
          'inline-flex items-center overflow-hidden text-ellipsis whitespace-nowrap',
          isMd ? 'h-6 leading-6' : 'h-5 leading-4.5',
        )}
      >
        {label}
      </span>
    </div>
  )
}
