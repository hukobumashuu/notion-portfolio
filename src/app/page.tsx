import { SaveStatusProvider } from '@/lib/context/SaveStatusContext'
import type { Collection, Project } from '@/lib/types'
import { getCollectionsWithProjects, getProfile } from '@/lib/supabase/queries'
import { HeroSection } from '@/components/profile'
import { ProjectsGrid } from '@/components/projects'
import type { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
  const profile = await getProfile()
  const title = profile?.site_title || 'Portfolio'
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
    twitter: { card: 'summary', title, description },
  }
}

export const revalidate = 60

export default async function PublicPage() {
  const [profile, collectionsWithProjects] = await Promise.all([
    getProfile(),
    getCollectionsWithProjects(),
  ])

  const siteTitle = profile?.site_title || "👨‍💻 Hey there, I'm Owner!"

  return (
    <SaveStatusProvider>
      <header className="bg-notion-bg sticky top-0 z-50 flex h-11 w-full items-center justify-between overflow-hidden pr-2.5 pl-3">
        <div className="flex items-center gap-2 overflow-hidden">
          <span className="text-notion-text truncate text-[14px] font-medium">{siteTitle}</span>
        </div>
        <div></div>
      </header>

      <main className="notion-page-scroller min-h-[calc(100vh-44px)]">
        <HeroSection profile={profile} />

        <div className="notion-content mt-20 space-y-16 pb-16">
          {collectionsWithProjects.map((collection: Collection & { projects: Project[] }) => (
            <ProjectsGrid key={collection.id} collection={collection} isEditing={false} />
          ))}
        </div>
      </main>
    </SaveStatusProvider>
  )
}
