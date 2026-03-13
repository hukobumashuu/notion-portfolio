import { ProjectCardSkeleton } from '@/components/ui/ProjectCardSkeleton'

export default function Loading() {
  return (
    <main className="bg-surface min-h-screen">
      <div className="mx-auto max-w-5xl px-6 py-16">
        {/* Hero skeleton */}
        <div className="flex animate-pulse items-start gap-6">
          <div className="bg-surface-card h-20 w-20 shrink-0 rounded-full" />
          <div className="flex-1 space-y-3 pt-2">
            <div className="bg-surface-card h-8 w-48 rounded" />
            <div className="bg-surface-card h-4 w-96 rounded" />
          </div>
        </div>

        {/* Grid skeleton */}
        <div className="mt-20 space-y-16">
          <div>
            <div className="bg-surface-card mb-6 h-5 w-24 animate-pulse rounded" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <ProjectCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
