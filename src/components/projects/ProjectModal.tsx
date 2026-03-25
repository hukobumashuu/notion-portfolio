'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import type { Project, ToolTag } from '@/lib/types'
import { TagPill } from '@/components/ui/TagPill'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { EditableText } from '@/components/editor/EditableText'
import { TagEditor } from '@/components/editor/TagEditor'
import { useSaveStatus } from '@/lib/context/SaveStatusContext'
import { updateProject } from '@/lib/supabase/mutations'
import { cn } from '@/lib/utils'
import { NotionEditorWrapper } from '@/components/editor/NotionEditorWrapper'
import { ImageUpload } from '@/components/editor/ImageUpload'
import { EmojiPickerModal } from '@/components/editor/EmojiPickerModal'

interface ProjectModalProps {
  project: Project
  isEditing?: boolean
  children: React.ReactNode
  onProjectUpdate?: (fields: Partial<Project>) => void
}

export function ProjectModal({
  project,
  isEditing = false,
  children,
  onProjectUpdate,
}: ProjectModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { triggerSave } = useSaveStatus()

  const [localToolTags, setLocalToolTags] = useState(project.tool_tags || [])
  const [localSectorTags, setLocalSectorTags] = useState(project.sector_tags || [])
  const [localStatus] = useState(project.status)
  const [localDuration, setLocalDuration] = useState(project.duration)

  const modalRef = useRef<HTMLDivElement>(null)

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

  const showCover = isEditing || !!project.thumbnail_url

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
              {showCover && (
                <div className="border-notion-border group/cover bg-notion-bg relative h-[30vh] max-h-40 w-full shrink-0 border-b">
                  {isEditing ? (
                    <ImageUpload
                      bucket="projects"
                      path={`thumbnail_${project.id}`}
                      onUpload={(url) => {
                        onProjectUpdate?.({ thumbnail_url: url })
                        triggerSave(() => updateProject(project.id, { thumbnail_url: url }))
                      }}
                      className="h-full w-full"
                    >
                      {project.thumbnail_url ? (
                        <Image
                          src={project.thumbnail_url}
                          alt={project.title}
                          fill
                          className="object-cover object-[center_50%]"
                          sizes="768px"
                        />
                      ) : (
                        <div className="text-notion-text-muted flex h-full w-full items-center justify-center">
                          <span className="text-sm font-medium">Click to upload cover image</span>
                        </div>
                      )}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover/cover:bg-black/40">
                        <span className="text-sm font-medium text-white opacity-0 transition-opacity group-hover/cover:opacity-100">
                          Change Cover
                        </span>
                      </div>
                    </ImageUpload>
                  ) : project.thumbnail_url ? (
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
                  ) : null}
                </div>
              )}

              <div className="flex w-full flex-col items-start px-8 pb-20 sm:px-20 md:px-32">
                <div
                  className={cn(
                    'relative z-10 flex w-full flex-col',
                    showCover ? '-mt-12 md:-mt-16' : 'pt-8',
                  )}
                >
                  {/* ✅ THE FIX: The trigger needs to wrap the whole emoji so the picker attaches correctly */}
                  {isEditing ? (
                    <EmojiPickerModal
                      onEmojiSelect={(emoji) => {
                        onProjectUpdate?.({ emoji })
                        triggerSave(() => updateProject(project.id, { emoji }))
                      }}
                      className="group/emoji relative flex h-20 w-20 shrink-0 cursor-pointer items-center justify-center rounded-lg text-5xl shadow-sm drop-shadow-sm transition-all sm:h-24 sm:w-24 sm:text-6xl"
                    >
                      {project.emoji ?? '📄'}
                      <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/40 opacity-0 transition-opacity group-hover/emoji:opacity-100">
                        <span className="text-xs font-medium text-white">😀</span>
                      </div>
                    </EmojiPickerModal>
                  ) : (
                    <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-lg text-5xl shadow-sm drop-shadow-sm sm:h-24 sm:w-24 sm:text-6xl">
                      {project.emoji ?? '📄'}
                    </div>
                  )}

                  {isEditing ? (
                    <div className="mt-4 mb-8 w-full">
                      <EditableText
                        as="h1"
                        value={project.title}
                        onSave={(title) => {
                          onProjectUpdate?.({ title })
                          triggerSave(() => updateProject(project.id, { title }))
                        }}
                        isEditing={isEditing}
                        singleLine
                        className="text-notion-text text-3xl font-bold tracking-tight md:text-4xl"
                        placeholder="Project Title"
                      />
                    </div>
                  ) : (
                    <h1 className="text-notion-text mt-4 mb-8 text-3xl font-bold tracking-tight md:text-4xl">
                      {project.title}
                    </h1>
                  )}
                </div>

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

                <div className="w-full">
                  <NotionEditorWrapper
                    initialContent={project.content}
                    isEditing={isEditing}
                    onSave={(content: unknown) => {
                      triggerSave(() => updateProject(project.id, { content }))
                    }}
                  />
                </div>
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
