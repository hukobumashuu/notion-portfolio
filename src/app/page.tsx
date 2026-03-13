import { SaveStatusProvider } from '@/lib/context/SaveStatusContext'
import type { Collection, Project } from '@/lib/types'
import { getCollectionsWithProjects, getProfile } from '@/lib/supabase/queries'
import { HeroSection } from '@/components/profile'
import { ProjectsGrid } from '@/components/projects'
import type { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
  const profile = await getProfile()

  const title = profile?.name ?? 'Portfolio'
  const description = profile?.bio ? `${profile.role} — ${profile.bio}` : 'Personal portfolio'

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      images: profile?.avatar_url ? [{ url: profile.avatar_url, width: 400, height: 400 }] : [],
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
  }
}

export const revalidate = 60

export default async function PublicPage() {
  const [profile, collectionsWithProjects] = await Promise.all([
    getProfile(),
    getCollectionsWithProjects(),
  ])

  return (
    <SaveStatusProvider>
      <main className="bg-surface relative min-h-screen">
        {/* Unified Notion Width: max-w-5xl perfectly fits a 3-col grid */}
        <div className="mx-auto w-full max-w-5xl px-6 py-16 sm:px-10">
          <HeroSection profile={profile} isEditing={false} />

          <div className="mt-24 space-y-20">
            {collectionsWithProjects.map((collection: Collection & { projects: Project[] }) => (
              <ProjectsGrid key={collection.id} collection={collection} isEditing={false} />
            ))}
          </div>
        </div>
      </main>
    </SaveStatusProvider>
  )
}
