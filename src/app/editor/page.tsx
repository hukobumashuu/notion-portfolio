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
      <main className="mx-auto max-w-4xl space-y-16 px-6 pt-20 pb-16">
        <HeroSection profile={profile} isEditing={true} />
        <div className="space-y-16">
          {collections.map((collection: Collection & { projects: Project[] }) => (
            <ProjectsGrid key={collection.id} collection={collection} isEditing={true} />
          ))}

          <AddSectionButton position={collections.length} />
        </div>
      </main>
    </SaveStatusProvider>
  )
}
