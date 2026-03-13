'use client'

import Image from 'next/image'
import type { Project } from '@/lib/types'
import { TagPill } from '@/components/ui/TagPill'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { ProjectModal } from './ProjectModal'
import { EditableText } from '@/components/editor/EditableText'
import { useSaveStatus } from '@/lib/context/SaveStatusContext'
import { updateProject, deleteProject } from '@/lib/supabase/mutations'
import { ImageUpload } from '@/components/editor/ImageUpload'
import { useState, useEffect } from 'react' // ✅ Added useEffect
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { useRouter } from 'next/navigation'

const STATUS_OPTIONS = ['In Progress', 'Done', 'On Hold', 'Archived']

interface ProjectCardProps {
  project: Project
  isEditing?: boolean
}

export function ProjectCard({ project: initialProject, isEditing = false }: ProjectCardProps) {
  const { triggerSave } = useSaveStatus()
  const [showConfirm, setShowConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()
  const [project, setProject] = useState(initialProject)

  // ✅ THE BUG FIX: Sync local state when Next.js passes down a new array
  useEffect(() => {
    setProject(initialProject)
  }, [initialProject])

  function handleProjectUpdate(fields: Partial<Project>) {
    setProject((prev) => ({ ...prev, ...fields }))
  }

  function handleSave(field: 'title' | 'emoji' | 'status') {
    return (value: string) => {
      setProject((prev) => ({ ...prev, [field]: value }))
      triggerSave(() => updateProject(project.id, { [field]: value }))
    }
  }

  async function handleDelete() {
    setIsDeleting(true)
    try {
      await deleteProject(project.id)
      router.refresh()
    } finally {
      setIsDeleting(false)
      setShowConfirm(false)
    }
  }

  return (
    <ProjectModal project={project} isEditing={isEditing} onProjectUpdate={handleProjectUpdate}>
      {/* ✅ L-02: Added hover lift (-translate-y-0.5) and kept 'relative' */}
      <div className="group rounded-card border-surface-border bg-surface-card hover:border-teal/40 hover:shadow-teal/5 flex h-full cursor-pointer flex-col border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">
        <div className="rounded-t-card bg-surface relative h-48 w-full shrink-0 overflow-hidden">
          {isEditing ? (
            <div onClick={(e) => e.stopPropagation()} className="h-full w-full">
              <ImageUpload
                bucket="thumbnails"
                path={project.id}
                onUpload={(url) =>
                  triggerSave(() => updateProject(project.id, { thumbnail_url: url }))
                }
                className="h-full w-full"
              >
                {project.thumbnail_url ? (
                  <Image
                    src={project.thumbnail_url}
                    alt={project.title}
                    fill
                    className="object-cover opacity-80"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                ) : (
                  <div className="text-text-muted flex h-full w-full flex-col items-center justify-center gap-1">
                    <span className="text-2xl">🖼️</span>
                    <span className="text-xs">Click to upload</span>
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors hover:bg-black/40">
                  <span className="text-xs font-medium text-white opacity-0 transition-opacity hover:opacity-100">
                    Change thumbnail
                  </span>
                </div>
              </ImageUpload>
            </div>
          ) : project.thumbnail_url ? (
            <Image
              src={project.thumbnail_url}
              alt={project.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 33vw"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <EditableText
                as="span"
                value={project.emoji ?? '📄'}
                onSave={handleSave('emoji')}
                isEditing={isEditing}
                singleLine
                className="text-4xl"
                placeholder="📄"
              />
            </div>
          )}
        </div>

        {/* ✅ L-02: Content padding is now p-5 */}
        <div className="flex flex-1 flex-col p-5">
          <div className="mb-3">
            <EditableText
              as="h3"
              value={project.title}
              onSave={handleSave('title')}
              isEditing={isEditing}
              singleLine
              className="text-text-primary text-[13px] leading-snug font-semibold"
              placeholder="Project title..."
            />
          </div>

          {project.tool_tags.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-1.5">
              {project.tool_tags.map((tag) => (
                <TagPill key={tag.label} label={tag.label} color={tag.color} />
              ))}
            </div>
          )}

          <div className="mt-auto pt-2">
            {isEditing ? (
              <select
                value={project.status ?? 'In Progress'}
                onChange={(e) => handleSave('status')(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                className="border-surface-border bg-surface text-text-primary mt-1 rounded-md border px-2 py-1 text-xs focus:outline-none"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            ) : (
              <StatusBadge status={project.status} />
            )}
          </div>

          {isEditing && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                setShowConfirm(true)
              }}
              className="bg-surface-card/80 text-text-muted absolute top-2 right-2 z-10 flex h-6 w-6 items-center justify-center rounded-md transition-opacity hover:text-red-400"
              aria-label="Delete project"
            >
              🗑
            </button>
          )}

          <ConfirmDialog
            isOpen={showConfirm}
            title="Delete project?"
            description={`"${project.title}" and all its content will be permanently deleted.`}
            onConfirm={handleDelete}
            onCancel={() => setShowConfirm(false)}
            isLoading={isDeleting}
          />
        </div>
      </div>
    </ProjectModal>
  )
}
