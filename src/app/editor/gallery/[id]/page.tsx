import { redirect, notFound } from 'next/navigation'
import { createServerClient } from '@/lib/supabase'
import { getCollectionById } from '@/lib/supabase/queries'
import { ProjectsGrid } from '@/components/projects'
import { SaveStatusProvider } from '@/lib/context/SaveStatusContext' // ✅ The required provider
import { EditorSaveBar } from '@/components/editor/EditorSavebar' // ✅ The editor save bar
import Link from 'next/link'

export default async function EditorGalleryPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/editor/login')

  const resolvedParams = await params
  const collection = await getCollectionById(resolvedParams.id)

  if (!collection) notFound()

  return (
    // ✅ Wrap the editor page in the provider
    <SaveStatusProvider>
      {/* ✅ Add the Save Bar so you can save changes */}
      <EditorSaveBar />

      {/* Add pt-16 to clear the fixed SaveBar */}
      <main className="bg-surface min-h-screen pt-16">
        <div className="mx-auto w-full max-w-5xl px-6 py-16 sm:px-10">
          <Link
            href="/editor"
            className="text-text-muted hover:text-text-primary mb-12 inline-flex items-center text-sm transition-colors"
          >
            ← Back to Dashboard
          </Link>

          {/* ✅ Ensure isEditing is TRUE here! */}
          <ProjectsGrid collection={collection} isEditing={true} />
        </div>
      </main>
    </SaveStatusProvider>
  )
}
