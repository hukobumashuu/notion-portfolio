import { getPage } from '@/lib/supabase/queries'
import { SaveStatusProvider } from '@/lib/context/SaveStatusContext'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { NotionEditorWrapper } from '@/components/editor/NotionEditorWrapper'

export const revalidate = 60

// Next.js 15 treats params as a Promise, so we await it!
export default async function DynamicPublicPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params
  const page = await getPage(resolvedParams.slug)

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

          <div className="border-surface-border border-t pt-8">
            <NotionEditorWrapper slug={page.slug} initialContent={page.content} isEditing={false} />
          </div>
        </div>
      </main>
    </SaveStatusProvider>
  )
}
