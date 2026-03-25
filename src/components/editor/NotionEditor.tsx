'use client'

import { useMemo } from 'react'
import { PartialBlock } from '@blocknote/core'
import { useCreateBlockNote } from '@blocknote/react'
import { BlockNoteView } from '@blocknote/mantine'
import '@blocknote/mantine/style.css'
import { useSaveStatus } from '@/lib/context/SaveStatusContext'
import { updatePage } from '@/lib/supabase/mutations'
import { createClient as createBrowserClient } from '@/lib/supabase/client'

interface NotionEditorProps {
  slug?: string
  initialContent: unknown
  isEditing: boolean
  onSave?: (content: unknown) => void
}

export function NotionEditor({ slug, initialContent, isEditing, onSave }: NotionEditorProps) {
  const { triggerSave } = useSaveStatus()

  const initialBlocks = useMemo(() => {
    try {
      if (typeof initialContent === 'string') {
        const parsed = JSON.parse(initialContent)
        return Array.isArray(parsed) && parsed.length > 0 ? (parsed as PartialBlock[]) : undefined
      }
      return Array.isArray(initialContent) && initialContent.length > 0
        ? (initialContent as PartialBlock[])
        : undefined
    } catch {
      return undefined
    }
  }, [initialContent])

  const editor = useCreateBlockNote({
    initialContent: initialBlocks,
    uploadFile: async (file: File) => {
      const supabase = createBrowserClient()
      const fileExt = file.name.split('.').pop()
      const fileName = `editor-img-${Date.now()}.${fileExt}`

      const { error } = await supabase.storage.from('projects').upload(fileName, file, {
        upsert: true,
      })

      if (error) throw new Error(error.message)

      const { data } = supabase.storage.from('projects').getPublicUrl(fileName)
      return data.publicUrl
    },
  })

  return (
    <div className="-ml-12 w-full pt-4">
      <BlockNoteView
        editor={editor}
        editable={isEditing}
        onChange={() => {
          if (!isEditing) return
          const currentContent = editor.document

          if (onSave) {
            onSave(currentContent)
          } else if (slug) {
            triggerSave(() => updatePage(slug, currentContent as unknown))
          }
        }}
        theme={{
          colors: {
            editor: { text: '#f0efed', background: 'transparent' },
            menu: { text: '#f0efed', background: '#252525' },
            tooltip: { text: '#f0efed', background: '#252525' },
            hovered: { text: '#f0efed', background: '#2f2f2f' },
            selected: { text: '#f0efed', background: '#373737' },
            disabled: { text: '#ada9a3', background: '#191919' },
            shadow: '#00000033',
            border: '#383836',
            sideMenu: '#ada9a3',
            highlights: {
              gray: { text: '#ada9a3', background: '#252525' },
              brown: { text: '#bca290', background: '#382d26' },
              orange: { text: '#d5803b', background: '#3d2a1d' },
              yellow: { text: '#d8a32f', background: '#373325' },
              green: { text: '#46a171', background: '#24342b' },
              blue: { text: '#387dc9', background: '#213041' },
              purple: { text: '#b577d6', background: '#36293f' },
              pink: { text: '#db6999', background: '#3f2631' },
              red: { text: '#e56458', background: '#412725' },
            },
          },
          borderRadius: 4,
          fontFamily: 'inherit',
        }}
      />
    </div>
  )
}
