'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import type { Collection, Project } from '@/lib/types'
import { ProjectCard } from './ProjectCard'
import { AddProjectCard } from './AddProjectCard'
import { EditableText } from '@/components/editor/EditableText'
import { useSaveStatus } from '@/lib/context/SaveStatusContext'
import { updateCollection, deleteCollection } from '@/lib/supabase/mutations'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

const STATUS_OPTIONS = ['All', 'In Progress', 'Done', 'On Hold', 'Archived']
type SortOption = 'manual' | 'title_asc' | 'title_desc'

interface ProjectsGridProps {
  collection: Collection & { projects: Project[] }
  isEditing?: boolean
}

export function ProjectsGrid({ collection, isEditing = false }: ProjectsGridProps) {
  const { triggerSave } = useSaveStatus()
  const router = useRouter()

  // --- Deletion States ---
  const [showConfirm, setShowConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // --- Database Control States ---
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [filterStatus, setFilterStatus] = useState<string>('All')
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [sortBy, setSortBy] = useState<SortOption>('manual')
  const [isSortOpen, setIsSortOpen] = useState(false)

  async function handleDelete() {
    setIsDeleting(true)
    try {
      await deleteCollection(collection.id)
      router.refresh()
    } finally {
      setIsDeleting(false)
      setShowConfirm(false)
    }
  }

  // --- Local Filtering & Sorting Magic ---
  const displayProjects = useMemo(() => {
    let result = [...collection.projects]

    // 1. Apply Status Filter
    if (filterStatus !== 'All') {
      result = result.filter((p) => p.status === filterStatus)
    }

    // 2. Apply Text Search
    if (searchQuery.trim()) {
      const lowerQuery = searchQuery.toLowerCase()
      result = result.filter((p) => p.title.toLowerCase().includes(lowerQuery))
    }

    // 3. Apply Sorting
    if (sortBy === 'title_asc') {
      result.sort((a, b) => a.title.localeCompare(b.title))
    } else if (sortBy === 'title_desc') {
      result.sort((a, b) => b.title.localeCompare(a.title))
    } else {
      result.sort((a, b) => a.position - b.position) // Default manual order
    }

    return result
  }, [collection.projects, filterStatus, searchQuery, sortBy])

  if (!isEditing && collection.projects.length === 0) return null

  return (
    <section className="w-full">
      {/* --- Section Header --- */}
      <div className="group/header mb-4 flex flex-wrap items-center gap-3">
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

        {/* ✅ Public View gets a Link, Editor View keeps EditableText */}
        {!isEditing ? (
          <Link
            href={`/gallery/${collection.id}`}
            className="text-text-primary hover:text-teal shrink-0 text-sm font-semibold tracking-wide uppercase transition-colors"
          >
            {collection.title}
          </Link>
        ) : (
          <EditableText
            as="span"
            value={collection.title}
            onSave={(val) => triggerSave(() => updateCollection(collection.id, val))}
            isEditing={isEditing}
            singleLine
            className="text-text-primary shrink-0 text-sm font-semibold tracking-wide uppercase"
            placeholder="Section title..."
          />
        )}

        <div className="border-surface-border flex-1 border-t" />

        {/* --- Database Controls (Filter/Sort/Search) --- */}
        <div className="text-text-muted flex items-center gap-1 text-sm">
          {/* Filter Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setIsFilterOpen(!isFilterOpen)
                setIsSortOpen(false)
              }}
              className={cn(
                'hover:bg-surface-border/50 flex items-center gap-1.5 rounded-md px-2 py-1 transition-colors',
                filterStatus !== 'All' && 'bg-teal/10 text-teal hover:bg-teal/20',
              )}
            >
              <span>{filterStatus !== 'All' ? `Status: ${filterStatus}` : 'Filter'}</span>
            </button>
            {isFilterOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setIsFilterOpen(false)} />
                <div className="bg-surface-card border-surface-border absolute top-full right-0 z-20 mt-1 w-32 rounded-md border p-1 shadow-lg">
                  {STATUS_OPTIONS.map((status) => (
                    <button
                      key={status}
                      onClick={() => {
                        setFilterStatus(status)
                        setIsFilterOpen(false)
                      }}
                      className="text-text-primary hover:bg-surface-border/50 block w-full rounded px-2 py-1.5 text-left text-xs transition-colors"
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setIsSortOpen(!isSortOpen)
                setIsFilterOpen(false)
              }}
              className={cn(
                'hover:bg-surface-border/50 flex items-center gap-1.5 rounded-md px-2 py-1 transition-colors',
                sortBy !== 'manual' && 'bg-teal/10 text-teal hover:bg-teal/20',
              )}
            >
              <span>
                {sortBy === 'title_asc'
                  ? 'Sort: A-Z'
                  : sortBy === 'title_desc'
                    ? 'Sort: Z-A'
                    : 'Sort'}
              </span>
            </button>
            {isSortOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setIsSortOpen(false)} />
                <div className="bg-surface-card border-surface-border absolute top-full right-0 z-20 mt-1 w-32 rounded-md border p-1 shadow-lg">
                  {[
                    { label: 'Manual', value: 'manual' },
                    { label: 'Title (A-Z)', value: 'title_asc' },
                    { label: 'Title (Z-A)', value: 'title_desc' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setSortBy(option.value as SortOption)
                        setIsSortOpen(false)
                      }}
                      className="text-text-primary hover:bg-surface-border/50 block w-full rounded px-2 py-1.5 text-left text-xs transition-colors"
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Search Toggle */}
          {isSearchOpen ? (
            <div className="border-surface-border bg-surface flex items-center gap-1.5 rounded-md border px-2 py-1">
              <svg width="12" height="12" viewBox="0 0 14 14" fill="currentColor">
                <path d="M5.5 0a5.5 5.5 0 1 0 3.32 9.8l3.47 3.47.71-.7-3.47-3.47A5.5 5.5 0 0 0 5.5 0zm0 1a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9z" />
              </svg>
              <input
                autoFocus
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onBlur={() => {
                  if (!searchQuery) setIsSearchOpen(false)
                }}
                placeholder="Search..."
                className="text-text-primary w-24 bg-transparent text-xs outline-none"
              />
            </div>
          ) : (
            <button
              onClick={() => setIsSearchOpen(true)}
              className="hover:bg-surface-border/50 flex h-7 w-7 items-center justify-center rounded-md transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                <path d="M5.5 0a5.5 5.5 0 1 0 3.32 9.8l3.47 3.47.71-.7-3.47-3.47A5.5 5.5 0 0 0 5.5 0zm0 1a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9z" />
              </svg>
            </button>
          )}
        </div>

        {/* Editor Buttons (Hidden until hover) */}
        {isEditing && (
          <div className="ml-2 flex items-center gap-1 opacity-0 transition-opacity group-hover/header:opacity-100">
            {/* ✅ New Open as Page Button */}
            <Link
              href={`/editor/gallery/${collection.id}`}
              className="border-surface-border hover:border-teal hover:text-teal text-text-muted flex h-6 w-6 items-center justify-center rounded-md border text-xs transition-colors"
              title="Open as full page"
            >
              ⤢
            </Link>
            {/* Trash Can */}
            <button
              onClick={() => setShowConfirm(true)}
              className="border-surface-border text-text-muted flex h-6 w-6 items-center justify-center rounded-md border text-xs transition-colors hover:border-red-400 hover:text-red-400"
              aria-label="Delete section"
            >
              🗑
            </button>
          </div>
        )}
      </div>

      {/* --- Projects Grid --- */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {displayProjects.map((project) => (
          <div key={project.id} className="h-full">
            <ProjectCard project={project} isEditing={isEditing} />
          </div>
        ))}

        {/* Only allow adding new projects if we aren't currently searching/filtering */}
        {isEditing && filterStatus === 'All' && !searchQuery && (
          <div className="h-full">
            <AddProjectCard collectionId={collection.id} position={collection.projects.length} />
          </div>
        )}
      </div>

      {/* Empty State when filters are too strict */}
      {collection.projects.length > 0 && displayProjects.length === 0 && (
        <p className="text-text-muted mt-4 text-sm">No results</p>
      )}

      {/* Empty State when zero projects exist */}
      {!isEditing && collection.projects.length === 0 && (
        <p className="text-text-muted mt-4 text-sm">No projects yet.</p>
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showConfirm}
        title="Delete section?"
        description={`"${collection.title}" and all projects inside it will be permanently deleted.`}
        onConfirm={handleDelete}
        onCancel={() => setShowConfirm(false)}
        isLoading={isDeleting}
      />
    </section>
  )
}
