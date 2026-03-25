'use client'

import dynamic from 'next/dynamic'

const NotionEditor = dynamic(() => import('./NotionEditor').then((mod) => mod.NotionEditor), {
  ssr: false,
})

interface NotionEditorWrapperProps {
  slug?: string // ✅ Made optional
  initialContent: unknown
  isEditing: boolean
  onSave?: (content: unknown) => void // ✅ Added custom save function
}

export function NotionEditorWrapper(props: NotionEditorWrapperProps) {
  return <NotionEditor {...props} />
}
