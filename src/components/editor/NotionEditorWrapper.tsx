'use client'

import dynamic from 'next/dynamic'

// 1. We dynamically import the editor here, inside a Client boundary
const NotionEditor = dynamic(() => import('./NotionEditor').then((mod) => mod.NotionEditor), {
  ssr: false,
})

interface NotionEditorWrapperProps {
  slug: string
  initialContent: unknown
  isEditing: boolean
}

// 2. We export a standard React component that passes the props down
export function NotionEditorWrapper(props: NotionEditorWrapperProps) {
  return <NotionEditor {...props} />
}
