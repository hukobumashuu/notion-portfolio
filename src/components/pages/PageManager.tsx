'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { Page } from '@/lib/types'
import { addPage, deletePage } from '@/lib/supabase/mutations'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'

export function PageManager({ pages }: { pages: Page[] }) {
  const router = useRouter()
  const [isCreating, setIsCreating] = useState(false)
  const [deleteSlug, setDeleteSlug] = useState<string | null>(null)

  async function handleAddPage() {
    setIsCreating(true)
    try {
      const newSlug = await addPage()
      router.push(`/editor/${newSlug}`)
    } catch (error) {
      console.error(error)
      setIsCreating(false)
    }
  }

  async function handleDelete() {
    if (!deleteSlug) return
    try {
      await deletePage(deleteSlug)
      router.refresh()
    } finally {
      setDeleteSlug(null)
    }
  }

  // Filter out the contact page if you want to manage it separately, or leave it in!
  const displayPages = pages.filter((p) => p.slug !== 'contact')

  return (
    <section className="w-full">
      <div className="mb-6 flex items-center gap-3">
        <div className="border-surface-border bg-surface-card flex h-5 w-5 shrink-0 items-center justify-center rounded border">
          <span className="text-text-muted text-[10px]">📄</span>
        </div>
        <h2 className="text-text-primary shrink-0 text-sm font-semibold tracking-wide uppercase">
          Pages
        </h2>
        <div className="border-surface-border flex-1 border-t" />
        <button
          onClick={handleAddPage}
          disabled={isCreating}
          className="hover:bg-surface-border/50 text-text-muted hover:text-text-primary rounded-md px-2 py-1 text-xs transition-colors"
        >
          {isCreating ? 'Creating...' : '+ New Page'}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {displayPages.map((page) => (
          <div
            key={page.id}
            className="border-surface-border bg-surface-card hover:border-teal/40 hover:shadow-teal/5 group relative flex flex-col rounded-lg border p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
          >
            <Link href={`/editor/${page.slug}`} className="flex-1 outline-none">
              <h3 className="text-text-primary flex items-center gap-2 font-medium">
                {page.title}
                {page.is_protected && (
                  <span className="text-[10px]" title="Protected core page">
                    🔒
                  </span>
                )}
              </h3>
              <p className="text-text-muted mt-1 text-xs">/{page.slug}</p>
            </Link>

            {!page.is_protected && (
              <button
                onClick={(e) => {
                  e.preventDefault()
                  setDeleteSlug(page.slug)
                }}
                className="text-text-muted absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-md opacity-0 transition-opacity group-hover:opacity-100 hover:text-red-400"
              >
                🗑
              </button>
            )}
          </div>
        ))}
        {displayPages.length === 0 && (
          <p className="text-text-muted text-sm">No custom pages yet.</p>
        )}
      </div>

      <ConfirmDialog
        isOpen={!!deleteSlug}
        title="Delete page?"
        description="This page and all its content will be permanently deleted."
        onConfirm={handleDelete}
        onCancel={() => setDeleteSlug(null)}
        isLoading={false}
      />
    </section>
  )
}
