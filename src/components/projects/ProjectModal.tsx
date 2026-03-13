'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import type { ContentBlock, ContentBlockType, Project, ToolTag } from '@/lib/types'
import { TagPill } from '@/components/ui/TagPill'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { EditableText } from '@/components/editor/EditableText'
import { TagEditor } from '@/components/editor/TagEditor'
import { createClient as createBrowserClient } from '@/lib/supabase/client'
import { useSaveStatus } from '@/lib/context/SaveStatusContext'
import {
  updateContentBlock,
  updateProject,
  addContentBlock,
  deleteContentBlock,
} from '@/lib/supabase/mutations'
import { cn } from '@/lib/utils'

interface ProjectModalProps {
  project: Project
  isEditing?: boolean
  children: React.ReactNode
  onProjectUpdate?: (fields: Partial<Project>) => void
}

const BLOCK_TYPES: { type: ContentBlockType; label: string; icon: string }[] = [
  { type: 'heading', label: 'Heading', icon: 'H1' },
  { type: 'subheading', label: 'Subheading', icon: 'H2' },
  { type: 'paragraph', label: 'Paragraph', icon: '¶' },
  { type: 'blockquote', label: 'Quote', icon: '"' },
]

export function ProjectModal({
  project,
  isEditing = false,
  children,
  onProjectUpdate,
}: ProjectModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [blocks, setBlocks] = useState<ContentBlock[]>([])
  const [isLoadingBlocks, setIsLoadingBlocks] = useState(false)
  const { triggerSave } = useSaveStatus()

  const [localToolTags, setLocalToolTags] = useState(project.tool_tags)
  const [localSectorTags, setLocalSectorTags] = useState(project.sector_tags)
  const [localStatus] = useState(project.status)
  const [localDuration, setLocalDuration] = useState(project.duration)

  const modalRef = useRef<HTMLDivElement>(null)

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

  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    modalRef.current?.focus()
  }, [isOpen])

  async function handleAddBlock(type: ContentBlockType) {
    await addContentBlock(project.id, type, blocks.length)
    const supabase = createBrowserClient()
    const { data } = await supabase
      .from('content_blocks')
      .select('*')
      .eq('project_id', project.id)
      .order('position', { ascending: true })
    setBlocks(data ?? [])
  }

  async function handleDeleteBlock(id: string) {
    await deleteContentBlock(id)
    setBlocks((prev) => prev.filter((b) => b.id !== id))
  }

  return (
    <>
      <div onClick={() => setIsOpen(true)}>{children}</div>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 px-0 py-0 backdrop-blur-sm sm:items-center sm:px-4 sm:py-8"
          onClick={(e) => e.target === e.currentTarget && setIsOpen(false)}
        >
          <div
            ref={modalRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-label={project.title}
            className="bg-surface-modal sm:rounded-card sm:border-surface-border relative flex h-full w-full flex-col overflow-hidden border-0 shadow-2xl focus:outline-none sm:h-auto sm:max-h-[90vh] sm:max-w-2xl sm:border"
          >
            <button
              onClick={() => setIsOpen(false)}
              className="text-text-muted hover:bg-surface-border hover:text-text-primary absolute top-4 right-4 z-10 flex h-7 w-7 items-center justify-center rounded-md transition-colors"
              aria-label="Close modal"
            >
              ✕
            </button>

            <div className="overflow-y-auto">
              {project.thumbnail_url && (
                <div className="bg-surface relative h-48 w-full shrink-0">
                  <Image
                    src={project.thumbnail_url}
                    alt={project.title}
                    fill
                    className="object-cover"
                    sizes="672px"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                </div>
              )}

              <div className="p-8">
                <div className="mb-6 flex items-center gap-3">
                  <span className="text-3xl">{project.emoji ?? '📄'}</span>
                  <h2 className="text-text-primary text-2xl font-bold">{project.title}</h2>
                </div>

                <div className="mb-8 space-y-3">
                  {/* ✅ Added icon="⊞" */}
                  {(localToolTags.length > 0 || isEditing) && (
                    <MetaRow label="Tools Used" icon="⊞">
                      {isEditing ? (
                        <TagEditor
                          tags={localToolTags}
                          withColor
                          placeholder="Add tool..."
                          onChange={(tags) => {
                            setLocalToolTags(tags as ToolTag[])
                            onProjectUpdate?.({ tool_tags: tags as ToolTag[] })
                            triggerSave(() =>
                              updateProject(project.id, { tool_tags: tags as ToolTag[] }),
                            )
                          }}
                        />
                      ) : (
                        <div className="flex flex-wrap gap-1.5">
                          {localToolTags.map((tag) => (
                            <TagPill key={tag.label} label={tag.label} color={tag.color} />
                          ))}
                        </div>
                      )}
                    </MetaRow>
                  )}

                  {/* ✅ Added icon="◈" */}
                  {(localSectorTags.length > 0 || isEditing) && (
                    <MetaRow label="Sector" icon="◈">
                      {isEditing ? (
                        <TagEditor
                          tags={localSectorTags.map((label) => ({ label }))}
                          withColor={false}
                          placeholder="Add sector..."
                          onChange={(tags) => {
                            setLocalSectorTags(tags.map((t) => t.label))
                            onProjectUpdate?.({ sector_tags: tags.map((t) => t.label) })
                            triggerSave(() =>
                              updateProject(project.id, { sector_tags: tags.map((t) => t.label) }),
                            )
                          }}
                        />
                      ) : (
                        <div className="flex flex-wrap gap-1.5">
                          {localSectorTags.map((tag) => (
                            <TagPill key={tag} label={tag} />
                          ))}
                        </div>
                      )}
                    </MetaRow>
                  )}

                  {/* ✅ Added icon="◎" */}
                  {localStatus && (
                    <MetaRow label="Status" icon="◎">
                      <StatusBadge status={localStatus} />
                    </MetaRow>
                  )}

                  {/* ✅ Added icon="⏱" */}
                  {(localDuration || isEditing) && (
                    <MetaRow label="Duration" icon="⏱">
                      <EditableText
                        // ✅ Changed from "span" to "div"
                        as="p"
                        value={localDuration ?? ''}
                        onSave={(val) => {
                          setLocalDuration(val)
                          onProjectUpdate?.({ duration: val })
                          triggerSave(() => updateProject(project.id, { duration: val }))
                        }}
                        isEditing={isEditing}
                        singleLine
                        // ✅ Added "w-full" so the entire row is clickable
                        className="text-text-primary w-full text-sm"
                        placeholder="e.g. 10 weeks"
                      />
                    </MetaRow>
                  )}
                </div>

                <hr className="border-surface-border mb-8" />

                {isLoadingBlocks ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="bg-surface-card h-4 animate-pulse rounded" />
                    ))}
                  </div>
                ) : (
                  // ✅ Changed space-y-4 to space-y-5
                  <div className="space-y-5">
                    {blocks.map((block) => (
                      <ContentBlockRenderer
                        key={block.id}
                        block={block}
                        isEditing={isEditing}
                        onDelete={() => handleDeleteBlock(block.id)}
                      />
                    ))}

                    {isEditing && (
                      <div className="border-surface-border mt-4 flex flex-wrap gap-2 border-t pt-4">
                        {BLOCK_TYPES.map(({ type, label, icon }) => (
                          <button
                            key={type}
                            onClick={() => handleAddBlock(type)}
                            className="border-surface-border text-text-muted hover:border-teal hover:text-teal flex items-center gap-1.5 rounded-md border border-dashed px-3 py-1.5 text-xs transition-colors"
                          >
                            <span className="font-mono">{icon}</span>
                            {label}
                          </button>
                        ))}
                      </div>
                    )}
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

function MetaRow({
  label,
  icon,
  children,
}: {
  label: string
  icon: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex w-28 shrink-0 items-center gap-2">
        <span className="text-text-muted text-xs">{icon}</span>
        <span className="text-text-muted text-xs">{label}</span>
      </div>
      <div className="flex-1">{children}</div>
    </div>
  )
}

function ContentBlockRenderer({
  block,
  isEditing,
  onDelete,
}: {
  block: ContentBlock
  isEditing: boolean
  onDelete: () => void
}) {
  const { triggerSave } = useSaveStatus()

  function handleSave(value: string) {
    triggerSave(() => updateContentBlock(block.id, { content: value }))
  }

  const editableProps = {
    value: block.content ?? '',
    onSave: handleSave,
    isEditing,
  }

  const blockContent = (() => {
    switch (block.type) {
      case 'heading':
        return (
          <h3 className="text-teal flex items-center gap-2 pt-2 text-base font-semibold">
            <span className="text-teal opacity-70">✳</span>
            <EditableText
              {...editableProps}
              as="span"
              singleLine
              placeholder="Section heading..."
            />
          </h3>
        )
      case 'subheading':
        return (
          <EditableText
            {...editableProps}
            as="h4"
            singleLine
            className="text-amber-portfolio text-base font-semibold"
            placeholder="Subheading..."
          />
        )
      case 'paragraph':
        return (
          <EditableText
            {...editableProps}
            as="p"
            className="text-text-muted text-[14px] leading-7"
            placeholder="Write something..."
          />
        )
      case 'blockquote':
        return (
          <blockquote className="border-teal bg-teal/5 rounded-r-md border-l-[3px] py-2 pl-4">
            <EditableText
              {...editableProps}
              as="p"
              className="text-teal text-sm italic"
              placeholder="A key quote or insight..."
            />
          </blockquote>
        )
      default:
        return null
    }
  })()

  return (
    <div className={cn('group/block relative', isEditing && 'pr-8')}>
      {blockContent}
      {isEditing && (
        <button
          onClick={onDelete}
          className="text-text-muted absolute top-0 right-0 flex h-6 w-6 items-center justify-center rounded opacity-0 transition-all group-hover/block:opacity-100 hover:text-red-400"
          aria-label="Delete block"
        >
          ✕
        </button>
      )}
    </div>
  )
}
