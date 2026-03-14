'use client'

import type { Collection, Project } from '@/lib/types'
import { ProjectCard } from './ProjectCard'
import { AddProjectCard } from './AddProjectCard'
import { EditableText } from '@/components/editor/EditableText'
import { useSaveStatus } from '@/lib/context/SaveStatusContext'
import { updateCollection } from '@/lib/supabase/mutations'
import { useRef, useEffect, useState } from 'react'

interface ProjectsGridProps {
  collection: Collection & { projects: Project[] }
  isEditing?: boolean
}

export function ProjectsGrid({ collection, isEditing = false }: ProjectsGridProps) {
  const { triggerSave } = useSaveStatus()

  // Interaction Refs
  const scrollRef = useRef<HTMLDivElement>(null)
  const isDown = useRef(false)
  const startX = useRef(0)
  const scrollLeftPos = useRef(0)

  // State to prevent accidental clicks when dragging
  const [isDragging, setIsDragging] = useState(false)

  // Enables Mouse Wheel vertical-to-horizontal scrolling
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY !== 0 && e.deltaX === 0) {
        e.preventDefault()
        el.scrollBy({ left: e.deltaY > 0 ? 100 : -100, behavior: 'auto' })
      }
    }

    el.addEventListener('wheel', handleWheel, { passive: false })
    return () => el.removeEventListener('wheel', handleWheel)
  }, [])

  // Drag-to-Scroll Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    isDown.current = true
    if (!scrollRef.current) return
    startX.current = e.pageX - scrollRef.current.offsetLeft
    scrollLeftPos.current = scrollRef.current.scrollLeft
    scrollRef.current.style.cursor = 'grabbing'
    scrollRef.current.style.scrollBehavior = 'auto' // Remove smooth for 1:1 drag
  }

  const handleMouseLeave = () => {
    isDown.current = false
    setIsDragging(false)
    if (!scrollRef.current) return
    scrollRef.current.style.cursor = 'grab'
    scrollRef.current.style.scrollBehavior = 'smooth'
  }

  const handleMouseUp = () => {
    isDown.current = false
    if (!scrollRef.current) return
    scrollRef.current.style.cursor = 'grab'
    scrollRef.current.style.scrollBehavior = 'smooth'
    setTimeout(() => setIsDragging(false), 50) // Delay to allow drag to finish before clicks register
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDown.current || !scrollRef.current) return
    e.preventDefault()
    const x = e.pageX - scrollRef.current.offsetLeft
    const walk = (x - startX.current) * 2 // Scroll speed multiplier

    // If they move more than 5px, register it as a drag (disables clicks)
    if (Math.abs(walk) > 5 && !isDragging) {
      setIsDragging(true)
    }

    scrollRef.current.scrollLeft = scrollLeftPos.current - walk
  }

  // Button Handlers
  function scrollLeftBtn() {
    scrollRef.current?.scrollBy({ left: -300, behavior: 'smooth' })
  }
  function scrollRightBtn() {
    scrollRef.current?.scrollBy({ left: 300, behavior: 'smooth' })
  }

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

        {/* Scroll buttons — visible on desktop */}
        {!isEditing && collection.projects.length > 0 && (
          <div className="flex shrink-0 gap-1">
            <button
              onClick={scrollLeftBtn}
              className="border-surface-border text-text-muted hover:border-teal hover:text-teal flex h-6 w-6 items-center justify-center rounded-md border text-xs transition-colors"
            >
              ←
            </button>
            <button
              onClick={scrollRightBtn}
              className="border-surface-border text-text-muted hover:border-teal hover:text-teal flex h-6 w-6 items-center justify-center rounded-md border text-xs transition-colors"
            >
              →
            </button>
          </div>
        )}
      </div>

      {/* Horizontal Carousel */}
      <div className="group relative">
        {/* Fade-out hint on right edge */}
        <div className="from-surface pointer-events-none absolute top-0 right-0 z-10 h-full w-24 bg-linear-to-l to-transparent" />

        <div
          ref={scrollRef}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          className="flex cursor-grab snap-x snap-mandatory gap-4 overflow-x-auto pb-6 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          style={{ scrollBehavior: 'smooth' }}
        >
          {collection.projects.map((project) => (
            <div
              key={project.id}
              className={`h-95 w-70 shrink-0 snap-start ${isDragging ? 'pointer-events-none' : ''}`}
            >
              <ProjectCard project={project} isEditing={isEditing} />
            </div>
          ))}

          {isEditing && (
            <div
              className={`h-95 w-70 shrink-0 snap-start ${isDragging ? 'pointer-events-none' : ''}`}
            >
              <AddProjectCard collectionId={collection.id} position={collection.projects.length} />
            </div>
          )}
        </div>
      </div>

      {!isEditing && collection.projects.length === 0 && (
        <p className="text-text-muted mt-4 text-sm">No projects yet.</p>
      )}
    </section>
  )
}
