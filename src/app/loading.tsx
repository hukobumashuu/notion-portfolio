import { ProjectCardSkeleton } from '@/components/ui/ProjectCardSkeleton'

export default function Loading() {
  return (
    // 🟢 Using the exact same fluid grid as page.tsx
    <main className="notion-page-scroller min-h-screen pt-14">
      {/* --- HERO SECTION SKELETON --- */}
      <section className="contents">
        {/* Cover Image */}
        <div className="notion-full-width border-notion-border bg-notion-bg-hover relative h-48 w-full animate-pulse border-b md:h-[30vh]" />

        {/* Profile Content */}
        <div className="notion-content flex w-full flex-col items-start pt-2">
          <div className="relative z-10 -mt-12 flex w-full flex-col md:-mt-16">
            {/* Avatar */}
            <div className="bg-notion-bg relative h-24 w-24 shrink-0 rounded-lg p-1 shadow-sm md:h-32 md:w-32">
              <div className="h-full w-full animate-pulse rounded-md bg-white/10" />
            </div>
            {/* Name */}
            <div className="mt-4 mb-2 h-10 w-64 animate-pulse rounded-md bg-white/10" />
          </div>

          {/* Bio & Callout Split (The exact 50/50 Math) */}
          <div className="mt-2 flex w-full flex-col gap-11.5 md:flex-row">
            {/* Left Col: Bio */}
            <div className="mt-4 flex w-full flex-col gap-2 py-3 md:w-[calc(50%-23px)]">
              <div className="h-6 w-full animate-pulse rounded bg-white/10" />
              <div className="h-6 w-5/6 animate-pulse rounded bg-white/10" />
              <div className="h-6 w-4/6 animate-pulse rounded bg-white/10" />
            </div>

            {/* Right Col: Callout Card */}
            <div className="flex w-full flex-col py-3 md:w-[calc(50%-23px)]">
              <div className="bg-notion-border-strong h-28 w-full animate-pulse rounded-[10px]" />
            </div>
          </div>
        </div>
      </section>

      {/* --- PROJECTS GRID SKELETON --- */}
      <div className="notion-content mt-20 space-y-16">
        <section className="mt-4 w-full">
          {/* Section Header */}
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 animate-pulse rounded bg-white/10" />
              <div className="h-7 w-48 animate-pulse rounded bg-white/10" />
            </div>
            <div className="flex gap-1">
              <div className="h-7 w-16 animate-pulse rounded-md bg-white/10" />
              <div className="h-7 w-16 animate-pulse rounded-md bg-white/10" />
              <div className="h-7 w-8 animate-pulse rounded-md bg-white/10" />
            </div>
          </div>

          {/* 🟢 Fluid Grid matching ProjectsGrid.tsx */}
          <div className="grid w-full grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-4 pt-2 pb-1">
            {[...Array(3)].map((_, i) => (
              <ProjectCardSkeleton key={i} />
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
