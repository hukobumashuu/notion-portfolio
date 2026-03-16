import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase'
import { getPage } from '@/lib/supabase/queries'
import { SaveStatusProvider } from '@/lib/context/SaveStatusContext'
import { EditorSaveBar } from '@/components/editor/EditorSavebar'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { NotionEditorWrapper } from '@/components/editor/NotionEditorWrapper'
import { ContactForm } from '@/components/ui/ContactForm'

export default async function ContactEditorPage() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/editor/login')

  const page = await getPage('contact')

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
            ← Back to Portfolio Editor
          </Link>

          <h1 className="text-text-primary mb-8 text-4xl font-bold tracking-tight">{page.title}</h1>

          {/* Editable Intro Text (BlockNote) */}
          <NotionEditorWrapper slug="contact" initialContent={page.content} isEditing={true} />

          {/* The Contact Form */}
          <ContactForm />
        </div>
      </main>
    </SaveStatusProvider>
  )
}
