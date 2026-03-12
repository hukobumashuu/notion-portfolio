import Image from 'next/image'
import type { Project } from '@/lib/types'
import { TagPill } from '@/components/ui/TagPill'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { ProjectModal } from './ProjectModal'

interface ProjectCardProps {
  project: Project
  _isEditing?: boolean
}

export function ProjectCard({ project, _isEditing = false }: ProjectCardProps) {
  return (
    <ProjectModal project={project} _isEditing={_isEditing}>
      {/* Card trigger — rendered as the modal's trigger button */}
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
            <div className="flex h-full w-full items-center justify-center text-4xl">
              {project.emoji ?? '📄'}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="mb-3 flex items-center gap-2">
            {project.thumbnail_url && <span className="text-lg">{project.emoji ?? '📄'}</span>}
            <h3 className="text-text-primary text-sm leading-snug font-semibold">
              {project.title}
            </h3>
          </div>

          {/* Tool tags */}
          {project.tool_tags.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-1.5">
              {project.tool_tags.map((tag) => (
                <TagPill key={tag.label} label={tag.label} color={tag.color} />
              ))}
            </div>
          )}

          {/* Status */}
          <StatusBadge status={project.status} />
        </div>
      </div>
    </ProjectModal>
  )
}
