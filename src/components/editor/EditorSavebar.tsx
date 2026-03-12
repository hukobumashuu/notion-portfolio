'use client'

import { EditorToolbar } from './EditorToolbar'
import { useSaveStatus } from '@/lib/context/SaveStatusContext'

export function EditorSaveBar() {
  const { status } = useSaveStatus()
  return <EditorToolbar saveStatus={status} />
}
