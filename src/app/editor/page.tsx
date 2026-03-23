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

  return (
    <SaveStatusProvider>
      <EditorSaveBar />

      {/* 🟢 Use the fluid Notion Grid on the <main> tag. 
          pt-14 exists here strictly to clear the sticky EditorSaveBar */}
      <main className="notion-page-scroller relative z-10 min-h-screen pt-14">
        {/* Hero section directly under the scroller so it can span full width */}
        <HeroSection profile={profile} isEditing={true} />

        {/* 🟢 Wrap the rest of the content strictly inside the content boundaries */}
        <div className="notion-content pb-16">
          {/* Page Manager */}
          <div className="mt-16">
            <PageManager pages={pages} />
          </div>

          {/* Projects Grid & Add Section */}
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
