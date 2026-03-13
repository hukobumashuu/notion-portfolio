export function ProjectCardSkeleton() {
  return (
    <div className="rounded-card border-surface-border bg-surface-card animate-pulse border">
      <div className="rounded-t-card bg-surface h-40 w-full" />
      <div className="space-y-3 p-4">
        <div className="bg-surface h-4 w-3/4 rounded" />
        <div className="flex gap-1.5">
          <div className="bg-surface h-5 w-16 rounded-full" />
          <div className="bg-surface h-5 w-12 rounded-full" />
        </div>
        <div className="bg-surface h-5 w-14 rounded" />
      </div>
    </div>
  )
}
