import { getCollectionsWithProjects, getProfile } from '@/lib/supabase/queries'
import { HeroSection } from '@/components/profile/HeroSection'
import { ProjectsGrid } from '@/components/projects/ProjectsGrid'

// Revalidate at most every 60 seconds
// Sprint 5 will add on-demand revalidation via /api/revalidate
export const revalidate = 60

export default async function PublicPage() {
  const [profile, collectionsWithProjects] = await Promise.all([
    getProfile(),
    getCollectionsWithProjects(),
  ])

  return (
    <main className="bg-surface min-h-screen">
      <div className="mx-auto max-w-5xl px-6 py-16">
        <HeroSection profile={profile} />

        <div className="mt-20 space-y-16">
          {collectionsWithProjects.map((collection) => (
            <ProjectsGrid key={collection.id} collection={collection} />
          ))}
        </div>
      </div>
    </main>
  )
}
