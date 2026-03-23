import { cn } from '@/lib/utils'

interface StatusBadgeProps {
  status?: string
  size?: 'sm' | 'md' // 🟢 Added size prop
}

export function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  if (!status) return null

  const isMd = size === 'md'

  return (
    <div
      className={cn(
        'm-0 flex max-w-full min-w-0 shrink-0 items-center overflow-hidden whitespace-nowrap',
        // 🟢 Switch geometries based on size
        isMd
          ? 'h-6 rounded-sm px-2 text-[16px] leading-6' // Larger for Modal
          : 'h-4.5 rounded-[3px] px-1.5 text-[14px] leading-4.5', // Small for Project Card
      )}
      style={{
        backgroundColor: 'rgba(255,252,235,0.1)', // Notion Gray Background
        color: '#f0efed', // Notion Text Color
      }}
    >
      <span
        className={cn(
          'inline-flex items-center overflow-hidden text-ellipsis whitespace-nowrap',
          isMd ? 'h-6 leading-6' : 'h-4.5 leading-4.5',
        )}
      >
        {status}
      </span>
    </div>
  )
}
