'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import type { ContentBlock, Project } from '@/lib/types'
import { TagPill } from '@/components/ui/TagPill'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { createClient as createBrowserClient } from '@/lib/supabase/client'

interface ProjectModalProps {
  project: Project
  _isEditing?: boolean
  children: React.ReactNode
}

export function ProjectModal({ project, children }: ProjectModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [blocks, setBlocks] = useState<ContentBlock[]>([])
  const [isLoadingBlocks, setIsLoadingBlocks] = useState(false)

  // Fetch blocks when modal opens
  useEffect(() => {
    if (!isOpen) return

    async function loadBlocks() {
      setIsLoadingBlocks(true)
      const supabase = createBrowserClient()
      const { data } = await supabase
        .from('content_blocks')
        .select('*')
        .eq('project_id', project.id)
        .order('position', { ascending: true })

      setBlocks(data ?? [])
      setIsLoadingBlocks(false)
    }

    loadBlocks()
  }, [isOpen, project.id])

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  return (
    <>
      {/* Trigger */}
      <div onClick={() => setIsOpen(true)}>{children}</div>

      {/* Modal overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-8 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && setIsOpen(false)}
        >
          <div className="rounded-card border-surface-border bg-surface-modal relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden border shadow-2xl">
            {/* Close button */}
            <button
              onClick={() => setIsOpen(false)}
              className="text-text-muted hover:bg-surface-border hover:text-text-primary absolute top-4 right-4 z-10 flex h-7 w-7 items-center justify-center rounded-md transition-colors"
              aria-label="Close modal"
            >
              ✕
            </button>

            {/* Scrollable content */}
            <div className="overflow-y-auto">
              {/* Cover image */}
              {project.thumbnail_url && (
                <div className="bg-surface relative h-48 w-full shrink-0">
                  <Image
                    src={project.thumbnail_url}
                    alt={project.title}
                    fill
                    className="object-cover"
                    sizes="672px"
                  />
                </div>
              )}

              <div className="p-8">
                {/* Title */}
                <div className="mb-6 flex items-center gap-3">
                  <span className="text-3xl">{project.emoji ?? '📄'}</span>
                  <h2 className="text-text-primary text-2xl font-bold">{project.title}</h2>
                </div>

                {/* Metadata rows */}
                <div className="mb-8 space-y-3">
                  {project.tool_tags.length > 0 && (
                    <MetaRow label="Tools Used">
                      <div className="flex flex-wrap gap-1.5">
                        {project.tool_tags.map((tag) => (
                          <TagPill key={tag.label} label={tag.label} color={tag.color} />
                        ))}
                      </div>
                    </MetaRow>
                  )}

                  {project.sector_tags.length > 0 && (
                    <MetaRow label="Sector">
                      <div className="flex flex-wrap gap-1.5">
                        {project.sector_tags.map((tag) => (
                          <TagPill key={tag} label={tag} />
                        ))}
                      </div>
                    </MetaRow>
                  )}

                  {project.status && (
                    <MetaRow label="Status">
                      <StatusBadge status={project.status} />
                    </MetaRow>
                  )}

                  {project.duration && (
                    <MetaRow label="Duration">
                      <span className="text-text-primary text-sm">{project.duration}</span>
                    </MetaRow>
                  )}
                </div>

                {/* Divider */}
                <hr className="border-surface-border mb-8" />

                {/* Content blocks */}
                {isLoadingBlocks ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="bg-surface-card h-4 animate-pulse rounded" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {blocks.map((block) => (
                      <ContentBlockRenderer key={block.id} block={block} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function MetaRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-4">
      <span className="text-text-muted w-24 shrink-0 text-sm">{label}</span>
      <div className="flex-1">{children}</div>
    </div>
  )
}

function ContentBlockRenderer({ block }: { block: ContentBlock }) {
  switch (block.type) {
    case 'heading':
      return (
        <h3 className="text-teal flex items-center gap-2 text-lg font-semibold">
          <span>✳</span>
          {block.content}
        </h3>
      )
    case 'subheading':
      return <h4 className="text-amber-portfolio text-base font-semibold">{block.content}</h4>
    case 'paragraph':
      return <p className="text-text-muted text-sm leading-relaxed">{block.content}</p>
    case 'blockquote':
      return (
        <blockquote className="border-teal border-l-2 pl-4">
          <p className="text-teal text-sm italic">{block.content}</p>
        </blockquote>
      )
    default:
      return null
  }
}
