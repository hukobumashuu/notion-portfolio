import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase'
import { getCollectionsWithProjects, getProfile } from '@/lib/supabase/queries'
import { HeroSection } from '@/components/profile'
import { ProjectsGrid } from '@/components/projects'
import { SaveStatusProvider } from '@/lib/context/SaveStatusContext'
import { EditorSaveBar } from '@/components/editor/EditorSavebar'
import type { Collection, Project } from '@/lib/types'
import { AddSectionButton } from '@/components/projects/AddSectionButton'

export default async function EditorPage() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/editor/login')

  const [profile, collections] = await Promise.all([getProfile(), getCollectionsWithProjects()])

  return (
    <SaveStatusProvider>
      <EditorSaveBar />
      <main className="bg-surface relative z-10 min-h-screen pt-16">
        {/* MATCHES PUBLIC PAGE EXACTLY */}
        <div className="mx-auto w-full max-w-5xl px-6 py-16 sm:px-10">
          <HeroSection profile={profile} isEditing={true} />

          <div className="mt-24 space-y-20">
            {collections.map((collection: Collection & { projects: Project[] }) => (
              <ProjectsGrid key={collection.id} collection={collection} isEditing={true} />
            ))}
            <AddSectionButton position={collections.length} />
          </div>
        </div>
      </main>
    </SaveStatusProvider>
  )
}
