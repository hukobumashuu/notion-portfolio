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
import { useState, useEffect } from 'react'
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
      {/* 🟢 Applied bg-[#2f2f2f2f] and adjusted hover state slightly so it still reacts to being clicked */}
      <div className="group border-notion-border-strong flex h-full cursor-pointer flex-col overflow-hidden rounded-[10px] border bg-[#2f2f2f] shadow-[0_2px_4px_rgba(25,25,25,0.08)] transition-colors duration-100 hover:bg-[#2f2f2f]">
        {/* Thumbnail Image */}
        <div className="border-notion-border-strong relative h-50 w-full shrink-0 overflow-hidden border-b">
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
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                ) : (
                  <div className="text-notion-text-muted bg-notion-bg-card flex h-full w-full flex-col items-center justify-center gap-1">
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
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          ) : (
            <div className="bg-notion-bg-card flex h-full w-full items-center justify-center">
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

        {/* 🟢 CONTENT BLOCK: Changed pb-1.5 to pb-3 to add a gap at the bottom of the card */}
        <div className="relative flex flex-1 flex-col px-2.5 pt-2 pb-3">
          {/* Title Row with Emoji */}
          {/* 🟢 Changed mb-1.5 to mb-3 to create a gap between the title and the tags */}
          <div className="mb-3 flex w-full items-start gap-1.5">
            <span className="mt-1 shrink-0 text-[14px] leading-none">{project.emoji ?? '📄'}</span>
            <EditableText
              as="h3"
              value={project.title}
              onSave={handleSave('title')}
              isEditing={isEditing}
              singleLine
              className="text-notion-text text-[15px] leading-normal font-medium wrap-break-word"
              placeholder="Project title..."
            />
          </div>

          {/* Tags Row */}
          {project.tool_tags.length > 0 && (
            <div className="mb-2 flex flex-wrap items-center gap-1 px-1">
              {project.tool_tags.map((tag) => (
                <TagPill key={tag.label} label={tag.label} color={tag.color} />
              ))}
            </div>
          )}

          {/* Status Row */}
          {/* 🟢 Added mt-auto to push the status pill down, preserving the pb-3 gap below it */}
          <div className="mt-auto flex items-center px-1">
            {isEditing ? (
              <select
                value={project.status ?? 'In Progress'}
                onChange={(e) => handleSave('status')(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                className="text-notion-text-muted border-notion-border-strong rounded border bg-transparent px-1 py-0.5 text-[12px] focus:outline-none"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            ) : (
              <StatusBadge status={project.status ?? undefined} />
            )}
          </div>

          {/* Editor Delete Button */}
          {isEditing && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                setShowConfirm(true)
              }}
              className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-md bg-black/40 text-white/70 opacity-0 transition-opacity group-hover:opacity-100 hover:text-red-400"
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
