import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase'
import { getCollectionsWithProjects, getProfile, getPages } from '@/lib/supabase/queries'
import { HeroSection } from '@/components/profile'
import { ProjectsGrid } from '@/components/projects'
import { SaveStatusProvider } from '@/lib/context/SaveStatusContext'
import { EditorSaveBar } from '@/components/editor/EditorSavebar'
import type { Collection, Project } from '@/lib/types'
import { AddSectionButton } from '@/components/projects/AddSectionButton'
import { PageManager } from '@/components/pages/PageManager'
import { EditableNavbarTitle } from '@/components/editor/EditableNavbarTitle'
import { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
  const profile = await getProfile()
  const avatarUrl = profile?.avatar_url

  // ✅ Same dynamic Favicon logic!
  const iconUrl =
    avatarUrl && avatarUrl.startsWith('http')
      ? avatarUrl
      : `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>${avatarUrl || '👋'}</text></svg>`

  return {
    title: `Editor | ${profile?.site_title || 'Portfolio'}`,
    icons: {
      icon: iconUrl,
    },
  }
}

export default async function EditorPage() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/editor/login')

  const [profile, collections, pages] = await Promise.all([
    getProfile(),
    getCollectionsWithProjects(),
    getPages(),
  ])

  const siteTitle = profile?.site_title || "👨‍💻 Hey there, I'm Owner!"

  return (
    <SaveStatusProvider>
      <header className="bg-notion-bg border-surface-border sticky top-0 z-50 flex h-11 w-full items-center justify-between overflow-hidden border-b pr-2.5 pl-3">
        <div className="flex items-center gap-2 overflow-hidden">
          {profile?.id && (
            <EditableNavbarTitle
              profileId={profile.id}
              initialTitle={siteTitle}
              avatarUrl={profile.avatar_url}
            />
          )}
          <span className="text-teal ml-2 shrink-0 text-xs opacity-70">(Editor Mode)</span>
        </div>
        <div></div>
      </header>

      <EditorSaveBar />

      <main className="notion-page-scroller relative z-10 min-h-screen pt-4">
        <HeroSection profile={profile} isEditing={true} />

        <div className="notion-content pb-16">
          <div className="mt-16">
            <PageManager pages={pages} />
          </div>

          <div className="mt-20 space-y-16">
            {collections.map((collection: Collection & { projects: Project[] }) => (
              <ProjectsGrid key={collection.id} collection={collection} isEditing={true} />
            ))}

            <div className="pt-4">
              <AddSectionButton position={collections.length} />
            </div>
          </div>
        </div>
      </main>
    </SaveStatusProvider>
  )
}
