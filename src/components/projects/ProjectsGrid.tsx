'use client'

import type { Collection, Project } from '@/lib/types'
import { ProjectCard } from './ProjectCard'
import { AddProjectCard } from './AddProjectCard'
import { EditableText } from '@/components/editor/EditableText'
import { useSaveStatus } from '@/lib/context/SaveStatusContext'
import { updateCollection } from '@/lib/supabase/mutations'

interface ProjectsGridProps {
  collection: Collection & { projects: Project[] }
  isEditing?: boolean
}

export function ProjectsGrid({ collection, isEditing = false }: ProjectsGridProps) {
  const { triggerSave } = useSaveStatus()

  if (!isEditing && collection.projects.length === 0) return null

  return (
    <section className="w-full">
      {/* Section Header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="border-surface-border bg-surface-card flex h-5 w-5 shrink-0 items-center justify-center rounded border">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <rect
              x="0"
              y="0"
              width="4"
              height="4"
              fill="currentColor"
              className="text-text-muted"
              rx="0.5"
            />
            <rect
              x="6"
              y="0"
              width="4"
              height="4"
              fill="currentColor"
              className="text-text-muted"
              rx="0.5"
            />
            <rect
              x="0"
              y="6"
              width="4"
              height="4"
              fill="currentColor"
              className="text-text-muted"
              rx="0.5"
            />
            <rect
              x="6"
              y="6"
              width="4"
              height="4"
              fill="currentColor"
              className="text-text-muted"
              rx="0.5"
            />
          </svg>
        </div>

        <EditableText
          as="span"
          value={collection.title}
          onSave={(val) => triggerSave(() => updateCollection(collection.id, val))}
          isEditing={isEditing}
          singleLine
          className="text-text-primary shrink-0 text-sm font-semibold tracking-wide uppercase"
          placeholder="Section title..."
        />

        <div className="border-surface-border flex-1 border-t" />
      </div>

      {/* RESTORED: Standard Notion 3-Column Grid! */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {collection.projects.map((project) => (
          <div key={project.id} className="h-full">
            <ProjectCard project={project} isEditing={isEditing} />
          </div>
        ))}

        {isEditing && (
          <div className="h-full">
            <AddProjectCard collectionId={collection.id} position={collection.projects.length} />
          </div>
        )}
      </div>

      {!isEditing && collection.projects.length === 0 && (
        <p className="text-text-muted mt-4 text-sm">No projects yet.</p>
      )}
    </section>
  )
}
