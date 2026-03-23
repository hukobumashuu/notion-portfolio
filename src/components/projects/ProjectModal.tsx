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
      <div className="h-full w-full" onClick={() => setIsOpen(true)}>
        {children}
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 px-0 py-0 backdrop-blur-sm sm:items-center sm:px-4 sm:py-8"
          onClick={(e) => e.target === e.currentTarget && setIsOpen(false)}
        >
          <div
            ref={modalRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-label={project.title}
            className="sm:border-notion-border bg-notion-bg-hover relative flex h-full w-full flex-col overflow-hidden border-0 shadow-2xl focus:outline-none sm:h-auto sm:max-h-[80vh] sm:max-w-4xl sm:rounded-[10px] sm:border"
          >
            <div className="bg-notion-bg-hover z-20 flex h-11 w-full shrink-0 items-center justify-between border-b border-transparent pr-2.5 pl-3">
              <div></div>

              <button
                onClick={() => setIsOpen(false)}
                className="text-notion-text-muted hover:text-notion-text flex h-8 w-8 items-center justify-center rounded-md transition-colors hover:bg-white/5"
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {/* COVER BANNER */}
              {project.thumbnail_url && (
                <div className="border-notion-border relative h-[30vh] max-h-40 w-full shrink-0 border-b">
                  <Image
                    src={project.thumbnail_url}
                    alt={project.title}
                    fill
                    className="object-cover object-[center_50%]"
                    sizes="768px"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                </div>
              )}

              {/* HERO SECTION: Avatar & Title */}
              <div className="flex w-full flex-col items-start px-20 pb-20 sm:px-40">
                <div
                  className={cn(
                    'relative z-10 flex w-full flex-col',
                    project.thumbnail_url ? '-mt-12 md:-mt-16' : 'pt-8',
                  )}
                >
                  <div className="bg-notion-bg-hover flex h-20 w-20 shrink-0 items-center justify-center rounded-lg text-5xl shadow-sm sm:h-24 sm:w-24 sm:text-6xl">
                    {project.emoji ?? '📄'}
                  </div>

                  <h1 className="text-notion-text mt-4 mb-8 text-3xl font-bold tracking-tight md:text-4xl">
                    {project.title}
                  </h1>
                </div>

                {/* PROPERTIES / METADATA */}
                <div className="mb-8 w-full space-y-2">
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
                        <div className="flex flex-wrap gap-1">
                          {localToolTags.map((tag) => (
                            <TagPill
                              key={tag.label}
                              label={tag.label}
                              color={tag.color}
                              size="md"
                            />
                          ))}
                        </div>
                      )}
                    </MetaRow>
                  )}

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
                        <div className="flex flex-wrap gap-1">
                          {localSectorTags.map((tag) => (
                            <TagPill key={tag} label={tag} size="md" />
                          ))}
                        </div>
                      )}
                    </MetaRow>
                  )}

                  {localStatus && (
                    <MetaRow label="Status" icon="◎">
                      <StatusBadge status={localStatus} size="md" />
                    </MetaRow>
                  )}

                  {(localDuration || isEditing) && (
                    <MetaRow label="Duration" icon="⏱">
                      <EditableText
                        as="p"
                        value={localDuration ?? ''}
                        onSave={(val) => {
                          setLocalDuration(val)
                          onProjectUpdate?.({ duration: val })
                          triggerSave(() => updateProject(project.id, { duration: val }))
                        }}
                        isEditing={isEditing}
                        singleLine
                        className="text-notion-text -ml-1 w-full rounded px-1 text-[16px] transition-colors hover:bg-white/5"
                        placeholder="e.g. 10 weeks"
                      />
                    </MetaRow>
                  )}
                </div>

                <hr className="border-notion-border mb-8 w-full" />

                {/* CONTENT BLOCKS */}
                {isLoadingBlocks ? (
                  <div className="w-full space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="bg-notion-border-strong h-4 animate-pulse rounded" />
                    ))}
                  </div>
                ) : (
                  <div className="w-full space-y-5">
                    {blocks.map((block) => (
                      <ContentBlockRenderer
                        key={block.id}
                        block={block}
                        isEditing={isEditing}
                        onDelete={() => handleDeleteBlock(block.id)}
                      />
                    ))}

                    {isEditing && (
                      <div className="border-notion-border mt-4 flex flex-wrap gap-2 border-t pt-4">
                        {BLOCK_TYPES.map(({ type, label, icon }) => (
                          <button
                            key={type}
                            onClick={() => handleAddBlock(type)}
                            className="border-notion-border text-notion-text-muted hover:border-notion-teal hover:text-notion-teal flex items-center gap-1.5 rounded-md border border-dashed px-3 py-1.5 text-xs transition-colors"
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
    <div className="flex items-center gap-2">
      <div className="flex w-32 shrink-0 items-center gap-1.5">
        <span className="text-notion-text-muted text-[16px] opacity-80">{icon}</span>
        <span className="text-notion-text-muted text-[16px]">{label}</span>
      </div>
      <div className="flex min-h-7 flex-1 items-center">{children}</div>
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
          <h3 className="text-notion-text flex items-center gap-2 pt-2 text-[24px] font-bold">
            {isEditing && <span className="text-notion-teal text-sm opacity-70">H1</span>}
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
            className="text-notion-text text-[20px] font-bold"
            placeholder="Subheading..."
          />
        )
      case 'paragraph':
        return (
          <EditableText
            {...editableProps}
            as="p"
            className="text-notion-text text-[16px] leading-normal"
            placeholder="Write something..."
          />
        )
      case 'blockquote':
        return (
          <blockquote className="border-notion-text text-notion-text border-l-[3px] py-1 pl-4 text-[16px] italic">
            <EditableText {...editableProps} as="p" placeholder="A key quote or insight..." />
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
          className="text-notion-text-muted absolute top-0 right-0 flex h-6 w-6 items-center justify-center rounded opacity-0 transition-all group-hover/block:opacity-100 hover:text-red-400"
          aria-label="Delete block"
        >
          ✕
        </button>
      )}
    </div>
  )
}
