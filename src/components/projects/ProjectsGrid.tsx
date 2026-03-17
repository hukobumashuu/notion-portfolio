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
    <section className="mt-4 w-full">
      {/* --- Section Header (Notion Exact Match) --- */}
      <div className="group/header mb-2 flex items-center justify-between">
        {/* LEFT: Icon + Title */}
        <div className="flex items-center gap-2">
          {/* Notion-style minimal gallery icon */}
          <div className="text-notion-text-muted flex h-6 w-6 shrink-0 items-center justify-center rounded">
            <svg width="14" height="14" viewBox="0 0 10 10" fill="none">
              <rect x="0" y="0" width="4" height="4" fill="currentColor" rx="0.5" />
              <rect x="6" y="0" width="4" height="4" fill="currentColor" rx="0.5" />
              <rect x="0" y="6" width="4" height="4" fill="currentColor" rx="0.5" />
              <rect x="6" y="6" width="4" height="4" fill="currentColor" rx="0.5" />
            </svg>
          </div>

          {!isEditing ? (
            <Link
              href={`/gallery/${collection.id}`}
              className="text-notion-text overflow-hidden rounded px-1 text-[22px] font-bold text-ellipsis whitespace-nowrap transition-colors hover:bg-white/5"
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
              className="text-notion-text overflow-hidden px-1 text-[22px] font-bold text-ellipsis whitespace-nowrap"
              placeholder="Section title..."
            />
          )}
        </div>

        {/* RIGHT: Database Controls (Filter/Sort/Search) */}
        <div className="text-notion-text-muted flex flex-wrap items-center justify-end gap-1 text-sm">
          {/* Filter Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setIsFilterOpen(!isFilterOpen)
                setIsSortOpen(false)
              }}
              className={cn(
                'flex items-center gap-1.5 rounded-md px-2 py-1 transition-colors hover:bg-white/5',
                filterStatus !== 'All' && 'text-notion-teal bg-notion-teal/10',
              )}
            >
              <span>{filterStatus !== 'All' ? `Status: ${filterStatus}` : 'Filter'}</span>
            </button>
            {isFilterOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setIsFilterOpen(false)} />
                <div className="bg-notion-bg-card border-notion-border absolute top-full right-0 z-20 mt-1 w-32 rounded-md border p-1 shadow-[0px_4px_12px_rgba(0,0,0,0.1)]">
                  {STATUS_OPTIONS.map((status) => (
                    <button
                      key={status}
                      onClick={() => {
                        setFilterStatus(status)
                        setIsFilterOpen(false)
                      }}
                      className="text-notion-text block w-full rounded px-2 py-1.5 text-left text-xs transition-colors hover:bg-white/5"
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
                'flex items-center gap-1.5 rounded-md px-2 py-1 transition-colors hover:bg-white/5',
                sortBy !== 'manual' && 'text-notion-teal bg-notion-teal/10',
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
                <div className="bg-notion-bg-card border-notion-border absolute top-full right-0 z-20 mt-1 w-32 rounded-md border p-1 shadow-[0px_4px_12px_rgba(0,0,0,0.1)]">
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
                      className="text-notion-text block w-full rounded px-2 py-1.5 text-left text-xs transition-colors hover:bg-white/5"
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
            <div className="border-notion-border bg-notion-bg flex items-center gap-1.5 rounded-md border px-2 py-1 shadow-sm">
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
                className="text-notion-text placeholder:text-notion-text-muted w-24 bg-transparent text-xs outline-none"
              />
            </div>
          ) : (
            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex h-7 w-7 items-center justify-center rounded-md transition-colors hover:bg-white/5"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                <path d="M5.5 0a5.5 5.5 0 1 0 3.32 9.8l3.47 3.47.71-.7-3.47-3.47A5.5 5.5 0 0 0 5.5 0zm0 1a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9z" />
              </svg>
            </button>
          )}

          {/* Editor Buttons */}
          {isEditing && (
            <div className="ml-1 flex items-center gap-1 opacity-0 transition-opacity group-hover/header:opacity-100">
              <Link
                href={`/editor/gallery/${collection.id}`}
                className="hover:text-notion-teal text-notion-text-muted flex h-7 w-7 items-center justify-center rounded-md text-xs transition-colors hover:bg-white/5"
                title="Open as full page"
              >
                ⤢
              </Link>
              <button
                onClick={() => setShowConfirm(true)}
                className="text-notion-text-muted flex h-7 w-7 items-center justify-center rounded-md text-xs transition-colors hover:bg-white/5 hover:text-red-400"
                aria-label="Delete section"
              >
                🗑
              </button>
            </div>
          )}
        </div>
      </div>

      {/* --- Projects Grid (The Fluid Notion Layout) --- */}
      <div className="grid w-full grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-4 pt-2 pb-1">
        {displayProjects.map((project) => (
          <div key={project.id} className="h-full">
            <ProjectCard project={project} isEditing={isEditing} />
          </div>
        ))}

        {/* Add Project Card Button */}
        {isEditing && filterStatus === 'All' && !searchQuery && (
          <div className="h-full">
            <AddProjectCard collectionId={collection.id} position={collection.projects.length} />
          </div>
        )}
      </div>

      {/* Empty State when filters are too strict */}
      {collection.projects.length > 0 && displayProjects.length === 0 && (
        <div className="text-notion-text-muted flex items-center justify-start gap-2 py-4 text-sm">
          No results
          <svg
            aria-hidden="true"
            role="graphics-symbol"
            viewBox="0 0 20 20"
            className="h-4 w-4 fill-current"
          >
            <path d="M9.978 7.154c-.804 0-1.333.456-1.438.874a.625.625 0 0 1-1.213-.303c.28-1.121 1.44-1.82 2.65-1.82 1.365 0 2.714.905 2.714 2.298 0 .812-.49 1.477-1.13 1.872l-.755.516a.84.84 0 0 0-.381.677.625.625 0 1 1-1.25 0c0-.688.36-1.318.921-1.706l.003-.002.784-.535.014-.008c.374-.228.544-.537.544-.814 0-.459-.517-1.049-1.463-1.049m.662 6.336a.8.8 0 1 1-1.6 0 .8.8 0 0 1 1.6 0"></path>
            <path d="M2.375 10a7.625 7.625 0 1 1 15.25 0 7.625 7.625 0 0 1-15.25 0M10 3.625a6.375 6.375 0 1 0 0 12.75 6.375 6.375 0 0 0 0-12.75"></path>
          </svg>
        </div>
      )}

      {/* Empty State when zero projects exist */}
      {!isEditing && collection.projects.length === 0 && (
        <div className="text-notion-text-muted flex items-center justify-start py-4 text-sm">
          No projects yet.
        </div>
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
