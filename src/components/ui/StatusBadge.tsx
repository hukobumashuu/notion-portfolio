import { cn } from '@/lib/utils'

export function StatusBadge({ status }: { status?: string }) {
  if (!status) return null

  return (
    <div
      className={cn(
        // Exact Notion geometry matching the TagPill
        'm-0 flex h-5 max-w-full min-w-0 shrink-0 items-center overflow-hidden rounded-[3px] px-1.5 text-[12px] leading-4.5 whitespace-nowrap',
      )}
      style={{
        backgroundColor: '#fffceb4e', // Notion Gray Background
        color: '#f0efed', // Notion Text Color
      }}
    >
      <span className="inline-flex h-5 items-center overflow-hidden leading-4.5 text-ellipsis whitespace-nowrap">
        {status}
      </span>
    </div>
  )
}
