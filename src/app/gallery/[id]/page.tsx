import { getCollectionById } from '@/lib/supabase/queries'
import { ProjectsGrid } from '@/components/projects'
import { SaveStatusProvider } from '@/lib/context/SaveStatusContext' // ✅ Import the provider
import Link from 'next/link'
import { notFound } from 'next/navigation'

export const revalidate = 60

export default async function PublicGalleryPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const collection = await getCollectionById(resolvedParams.id)

  if (!collection) notFound()

  return (
    // ✅ Wrap the page in the provider
    <SaveStatusProvider>
      <main className="bg-surface min-h-screen">
        <div className="mx-auto w-full max-w-5xl px-6 py-16 sm:px-10">
          <Link
            href="/"
            className="text-text-muted hover:text-text-primary mb-12 inline-flex items-center text-sm transition-colors"
          >
            ← Back to Portfolio
          </Link>

          <ProjectsGrid collection={collection} isEditing={false} />
        </div>
      </main>
    </SaveStatusProvider>
  )
}
