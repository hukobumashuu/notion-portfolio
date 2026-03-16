import { getPage } from '@/lib/supabase/queries'
import { SaveStatusProvider } from '@/lib/context/SaveStatusContext'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { NotionEditorWrapper } from '@/components/editor/NotionEditorWrapper'
import { ContactForm } from '@/components/ui/ContactForm'

export const revalidate = 60

export default async function ContactPublicPage() {
  const page = await getPage('contact')

  if (!page) notFound()

  return (
    <SaveStatusProvider>
      <main className="bg-surface min-h-screen">
        <div className="mx-auto w-full max-w-3xl px-6 py-16 sm:px-10">
          <Link
            href="/"
            className="text-text-muted hover:text-text-primary mb-8 inline-flex items-center text-sm transition-colors"
          >
            ← Back to Portfolio
          </Link>

          <h1 className="text-text-primary mb-8 text-4xl font-bold tracking-tight">{page.title}</h1>

          {/* Intro Text (BlockNote) */}
          <NotionEditorWrapper slug="contact" initialContent={page.content} isEditing={false} />

          {/* The Contact Form */}
          <ContactForm />
        </div>
      </main>
    </SaveStatusProvider>
  )
}
