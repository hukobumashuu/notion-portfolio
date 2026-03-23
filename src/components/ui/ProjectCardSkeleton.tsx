export function ProjectCardSkeleton() {
  return (
    // Matches the exact container of ProjectCard.tsx
    <div className="border-notion-border-strong flex h-full animate-pulse flex-col overflow-hidden rounded-[10px] border bg-[#2f2f2f2f] shadow-[0_2px_4px_rgba(25,25,25,0.08)]">
      {/* Thumbnail Skeleton (h-60 matches the image wrapper) */}
      <div className="border-notion-border-strong relative h-60 w-full shrink-0 border-b bg-white/5" />

      {/* Content Block Skeleton */}
      <div className="relative flex flex-1 flex-col px-2.5 pt-2 pb-3">
        {/* Title Row */}
        <div className="mb-3 flex w-full items-start gap-1.5">
          <div className="mt-1 h-3.5 w-3.5 shrink-0 rounded-sm bg-white/10" />
          <div className="h-5 w-3/4 rounded bg-white/10" />
        </div>

        {/* Tags Row */}
        <div className="mb-2 flex flex-wrap items-center gap-1 px-1">
          {/* Mocking the TagPill dimensions: h-[18px] rounded-[3px] */}
          <div className="h-4.5 w-16 rounded-[3px] bg-white/10" />
          <div className="h-4.5 w-12 rounded-[3px] bg-white/10" />
          <div className="h-4.5 w-24 rounded-[3px] bg-white/10" />
        </div>

        {/* Status Row */}
        <div className="mt-auto flex items-center px-1">
          {/* Mocking the StatusBadge dimensions: h-[18px] rounded-[3px] */}
          <div className="h-4.5 w-20 rounded-[3px] bg-white/10" />
        </div>
      </div>
    </div>
  )
}
