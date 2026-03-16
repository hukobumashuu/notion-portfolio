import { redirect, notFound } from 'next/navigation'
import { createServerClient } from '@/lib/supabase'
import { getPage } from '@/lib/supabase/queries'
import { SaveStatusProvider } from '@/lib/context/SaveStatusContext'
import { EditorSaveBar } from '@/components/editor/EditorSavebar'
import { NotionEditorWrapper } from '@/components/editor/NotionEditorWrapper'
import { EditablePageTitle } from './EditablePageTitle'
import { EditablePageSlug } from './EditablePageSlug'
import Link from 'next/link'

export default async function DynamicEditorPage({ params }: { params: Promise<{ slug: string }> }) {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/editor/login')

  const resolvedParams = await params
  const page = await getPage(resolvedParams.slug)

  if (!page) notFound()

  return (
    <SaveStatusProvider>
      <EditorSaveBar />
      <main className="bg-surface min-h-screen pt-16">
        <div className="mx-auto w-full max-w-3xl px-6 py-16 sm:px-10">
          <Link
            href="/editor"
            className="text-text-muted hover:text-text-primary mb-8 inline-flex items-center text-sm transition-colors"
          >
            ← Back to Dashboard
          </Link>

          {/* Extracted to a client component to handle the save trigger */}
          <div className="mb-8">
            <EditablePageTitle slug={page.slug} initialTitle={page.title} />
            <EditablePageSlug currentSlug={page.slug} isProtected={page.is_protected} />
          </div>

          <div className="border-surface-border border-t pt-8">
            <NotionEditorWrapper slug={page.slug} initialContent={page.content} isEditing={true} />
          </div>
        </div>
      </main>
    </SaveStatusProvider>
  )
}
