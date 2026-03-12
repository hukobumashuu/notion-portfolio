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
  return (
    <section>
      {/* Collection title */}
      <h2 className="text-text-primary text-lg font-semibold">
        <EditableText
          as="span"
          value={collection.title}
          onSave={(val) => triggerSave(() => updateCollection(collection.id, val))}
          isEditing={isEditing}
          singleLine
          placeholder="Section title..."
        />
      </h2>

      {/* Card grid */}
      {collection.projects.length === 0 ? (
        <p className="text-text-muted text-sm">No projects yet.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {collection.projects.map((project) => (
            <ProjectCard key={project.id} project={project} isEditing={isEditing} />
          ))}
          {isEditing && (
            <AddProjectCard collectionId={collection.id} position={collection.projects.length} />
          )}
        </div>
      )}
    </section>
  )
}
