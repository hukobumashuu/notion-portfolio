'use client'

import { EditableText } from '@/components/editor/EditableText'
import { useSaveStatus } from '@/lib/context/SaveStatusContext'
import { updatePageTitle } from '@/lib/supabase/mutations'

export function EditablePageTitle({ slug, initialTitle }: { slug: string; initialTitle: string }) {
  const { triggerSave } = useSaveStatus()

  return (
    <EditableText
      as="h1"
      value={initialTitle}
      onSave={(newTitle) => triggerSave(() => updatePageTitle(slug, newTitle))}
      isEditing={true}
      singleLine
      className="text-text-primary text-4xl font-bold tracking-tight"
      placeholder="Untitled Page"
    />
  )
}
