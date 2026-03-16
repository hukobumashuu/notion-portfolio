'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { Profile, CustomLink } from '@/lib/types'
import { updateProfile } from '@/lib/supabase/mutations'
import { useSaveStatus } from '@/lib/context/SaveStatusContext'

interface CalloutLinksProps {
  profile: Profile | null
  isEditing: boolean
}

export function CalloutLinks({ profile, isEditing }: CalloutLinksProps) {
  const { triggerSave } = useSaveStatus()
  const links = profile?.custom_links || []

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<CustomLink | null>(null)

  function handleSaveLinks(newLinks: CustomLink[]) {
    if (!profile) return
    triggerSave(() => updateProfile(profile.id, { custom_links: newLinks }))
  }

  function startEdit(link: CustomLink) {
    setEditingId(link.id)
    setEditForm({ ...link })
  }

  function saveEdit() {
    if (!editForm) return
    const newLinks = links.map((l) => (l.id === editForm.id ? editForm : l))
    handleSaveLinks(newLinks)
    setEditingId(null)
  }

  function deleteLink(id: string) {
    const newLinks = links.filter((l) => l.id !== id)
    handleSaveLinks(newLinks)
  }

  function addNewLink() {
    const newLink: CustomLink = {
      id: `link-${Date.now()}`,
      label: 'New Link',
      url: '/',
      emoji: '🔗',
    }
    handleSaveLinks([...links, newLink])
    startEdit(newLink)
  }

  return (
    <div className="bg-surface-card border-surface-border flex w-full flex-col gap-1 rounded-xl border p-2 shadow-sm">
      {links.map((link) => {
        // --- EDIT MODE UI ---
        if (isEditing && editingId === link.id && editForm) {
          return (
            <div
              key={link.id}
              className="bg-surface border-surface-border flex flex-col gap-3 rounded-lg border p-3"
            >
              <div className="flex gap-2">
                <input
                  value={editForm.emoji}
                  onChange={(e) => setEditForm({ ...editForm, emoji: e.target.value })}
                  className="bg-surface-card border-surface-border focus:border-teal/50 w-12 rounded border text-center outline-none"
                  placeholder="🔗"
                />
                <input
                  value={editForm.label}
                  onChange={(e) => setEditForm({ ...editForm, label: e.target.value })}
                  className="bg-surface-card border-surface-border focus:border-teal/50 flex-1 rounded border px-2 text-sm outline-none"
                  placeholder="Button Label"
                />
              </div>
              <input
                value={editForm.url}
                onChange={(e) => setEditForm({ ...editForm, url: e.target.value })}
                className="bg-surface-card border-surface-border focus:border-teal/50 w-full rounded border px-2 py-1 font-mono text-sm outline-none"
                placeholder="/your-url"
              />
              <div className="mt-1 flex justify-between">
                <button
                  onClick={() => deleteLink(link.id)}
                  className="text-xs font-medium text-red-400 hover:text-red-300"
                >
                  Delete
                </button>
                <div className="flex gap-3">
                  <button
                    onClick={() => setEditingId(null)}
                    className="text-text-muted hover:text-text-primary text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveEdit}
                    className="text-teal hover:text-teal/80 text-xs font-medium"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          )
        }

        // --- NORMAL / VIEW MODE UI ---
        return (
          <div key={link.id} className="group relative flex w-full items-center">
            <Link
              href={link.url}
              onClick={(e) => {
                if (isEditing) e.preventDefault()
              }} // Prevent navigation when in editor mode
              className="hover:bg-surface-border/50 text-text-primary flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors"
            >
              <span className="text-lg">{link.emoji}</span>
              {link.label}
            </Link>

            {/* Hover Edit Button (Only visible in editor) */}
            {isEditing && (
              <button
                onClick={() => startEdit(link)}
                className="bg-surface-card border-surface-border text-text-muted hover:text-teal absolute right-2 rounded border p-1.5 text-xs opacity-0 transition-opacity group-hover:opacity-100"
              >
                ⚙️
              </button>
            )}
          </div>
        )
      })}

      {/* Add New Link Button */}
      {isEditing && (
        <button
          onClick={addNewLink}
          className="text-text-muted hover:bg-surface-border/50 hover:text-text-primary border-surface-border mt-1 w-full rounded-lg border border-dashed py-2 text-xs font-medium transition-colors"
        >
          + Add Link
        </button>
      )}
    </div>
  )
}
