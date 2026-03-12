import type { Collection, Project } from '@/lib/types'
import { ProjectCard } from './ProjectCard'

interface ProjectsGridProps {
  collection: Collection & { projects: Project[] }
  isEditing?: boolean
}

export function ProjectsGrid({ collection, isEditing = false }: ProjectsGridProps) {
  return (
    <section>
      {/* Collection title */}
      <div className="mb-6 flex items-center gap-2">
        <span className="text-text-muted text-sm font-medium">⊞</span>
        <h2 className="text-text-primary text-lg font-semibold">{collection.title}</h2>
      </div>

      {/* Card grid */}
      {collection.projects.length === 0 ? (
        <p className="text-text-muted text-sm">No projects yet.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {collection.projects.map((project) => (
            <ProjectCard key={project.id} project={project} _isEditing={isEditing} />
          ))}
        </div>
      )}
    </section>
  )
}
