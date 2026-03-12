'use client'

import Image from 'next/image'
import type { Project } from '@/lib/types'
import { TagPill } from '@/components/ui/TagPill'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { ProjectModal } from './ProjectModal'
import { EditableText } from '@/components/editor/EditableText'
import { useSaveStatus } from '@/lib/context/SaveStatusContext'
import { updateProject } from '@/lib/supabase/mutations' // ✅ not queries.ts

const STATUS_OPTIONS = ['In Progress', 'Done', 'On Hold', 'Archived']

interface ProjectCardProps {
  project: Project
  isEditing?: boolean
}

export function ProjectCard({ project, isEditing = false }: ProjectCardProps) {
  const { triggerSave } = useSaveStatus()

  function handleSave(field: 'title' | 'emoji' | 'status') {
    return (value: string) => {
      triggerSave(() => updateProject(project.id, { [field]: value }))
    }
  }

  return (
    <ProjectModal project={project} isEditing={isEditing}>
      <div className="group rounded-card border-surface-border bg-surface-card hover:border-teal/40 cursor-pointer border transition-colors">
        {/* Thumbnail */}
        <div className="rounded-t-card bg-surface relative h-40 w-full overflow-hidden">
          {project.thumbnail_url ? (
            <Image
              src={project.thumbnail_url}
              alt={project.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 33vw"
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

        {/* Content — stopPropagation prevents opening modal when clicking editable fields */}
        <div className="p-4" onClick={(e) => isEditing && e.stopPropagation()}>
          <div className="mb-3">
            <EditableText
              as="h3"
              value={project.title}
              onSave={handleSave('title')}
              isEditing={isEditing}
              singleLine
              className="text-text-primary text-sm leading-snug font-semibold"
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
      </div>
    </ProjectModal>
  )
}
