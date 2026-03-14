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
      <main className="bg-surface min-h-screen">
        {/* Removed top padding (pt-10) here so the HeroSection's negative margin overlaps the banner correctly */}
        <div className="mx-auto max-w-5xl px-4 pb-16 sm:px-6">
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
