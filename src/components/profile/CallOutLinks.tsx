'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { Profile, CustomLink } from '@/lib/types'
import { updateProfile } from '@/lib/supabase/mutations'
import { useSaveStatus } from '@/lib/context/SaveStatusContext'
import { EmojiPickerModal } from '@/components/editor/EmojiPickerModal'

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
    <div className="bg-notion-border-strong flex w-full flex-col gap-1 rounded-[10px] border border-transparent p-2.5">
      {links.map((link) => {
        // --- EDIT MODE UI ---
        if (isEditing && editingId === link.id && editForm) {
          return (
            <div
              key={link.id}
              className="bg-notion-bg-card border-notion-border flex flex-col gap-3 rounded-lg border p-3"
            >
              <div className="flex gap-2">
                <div className="w-12 shrink-0">
                  <EmojiPickerModal
                    onEmojiSelect={(emoji) => setEditForm({ ...editForm, emoji })}
                    className="bg-notion-bg text-notion-text flex h-7.5 w-full cursor-pointer items-center justify-center rounded border border-transparent transition-colors hover:bg-white/5"
                  >
                    {editForm.emoji || '🔗'}
                  </EmojiPickerModal>
                </div>
                <input
                  value={editForm.label}
                  onChange={(e) => setEditForm({ ...editForm, label: e.target.value })}
                  className="bg-notion-bg focus:border-notion-teal/50 text-notion-text flex-1 rounded border border-transparent px-2 text-sm outline-none"
                  placeholder="Button Label"
                />
              </div>
              <input
                value={editForm.url}
                onChange={(e) => setEditForm({ ...editForm, url: e.target.value })}
                className="bg-notion-bg focus:border-notion-teal/50 text-notion-text w-full rounded border border-transparent px-2 py-1 font-mono text-sm outline-none"
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
                    className="text-notion-text-muted hover:text-notion-text text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveEdit}
                    className="text-notion-teal text-xs font-medium hover:opacity-80"
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
              // ✅ 4. Sleeker link styling with Notion's underline trick and tight padding
              className="text-notion-text flex w-full items-center rounded-md px-2 py-1.5 transition-colors hover:bg-white/5"
            >
              <span className="mr-1.5 inline-flex h-6 w-6 shrink-0 items-center justify-center text-lg">
                {link.emoji}
              </span>
              <span className="font-medium underline decoration-white/30 decoration-[0.05em] underline-offset-[10%] group-hover:decoration-white/50">
                {link.label}
              </span>
            </Link>

            {/* Hover Edit Button (Only visible in editor) */}
            {isEditing && (
              <button
                onClick={() => startEdit(link)}
                className="bg-notion-bg-card border-notion-border text-notion-text-muted hover:text-notion-teal absolute right-2 rounded border p-1.5 text-xs opacity-0 transition-opacity group-hover:opacity-100"
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
          className="text-notion-text-muted hover:text-notion-text border-notion-border mt-1 w-full rounded-md border border-dashed py-1.5 text-xs font-medium transition-colors hover:bg-white/5"
        >
          + Add Link
        </button>
      )}
    </div>
  )
}
