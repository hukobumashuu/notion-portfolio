import { SaveStatusProvider } from '@/lib/context/SaveStatusContext'
import type { Collection, Project } from '@/lib/types'
import { getCollectionsWithProjects, getProfile } from '@/lib/supabase/queries'
import { HeroSection } from '@/components/profile'
import { ProjectsGrid } from '@/components/projects'

export const revalidate = 60

export default async function PublicPage() {
  const [profile, collectionsWithProjects] = await Promise.all([
    getProfile(),
    getCollectionsWithProjects(),
  ])

  return (
    <SaveStatusProvider>
      <main className="bg-surface min-h-screen">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <HeroSection profile={profile} />

          <div className="mt-20 space-y-16">
            {collectionsWithProjects.map((collection: Collection & { projects: Project[] }) => (
              <ProjectsGrid key={collection.id} collection={collection} isEditing={false} />
            ))}
          </div>
        </div>
      </main>
    </SaveStatusProvider>
  )
}
