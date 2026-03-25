'use client'

import { EditableText } from '@/components/editor/EditableText'
import { useSaveStatus } from '@/lib/context/SaveStatusContext'
import { updateProfile } from '@/lib/supabase/mutations'

export function EditableNavbarTitle({
  profileId,
  initialTitle,
}: {
  profileId: string
  initialTitle: string
}) {
  const { triggerSave } = useSaveStatus()

  return (
    <EditableText
      as="span"
      value={initialTitle}
      onSave={(newTitle) => triggerSave(() => updateProfile(profileId, { site_title: newTitle }))}
      isEditing={true}
      singleLine
      className="text-notion-text hover:bg-surface-border/50 -ml-1 truncate rounded px-1 text-[14px] font-medium transition-colors outline-none"
      placeholder="👨‍💻 Hey there, I'm Owner!"
    />
  )
}
