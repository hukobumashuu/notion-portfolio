'use client'

import Image from 'next/image'
import { EditableText } from '@/components/editor/EditableText'
import { useSaveStatus } from '@/lib/context/SaveStatusContext'
import { updateProfile } from '@/lib/supabase/mutations'

export function EditableNavbarTitle({
  profileId,
  initialTitle,
  avatarUrl, // ✅ Accept the avatar data
}: {
  profileId: string
  initialTitle: string
  avatarUrl?: string | null
}) {
  const { triggerSave } = useSaveStatus()

  return (
    <div className="flex items-center gap-2">
      {/* ✅ The Synced Workspace Icon */}
      <div className="flex h-5 w-5 shrink-0 items-center justify-center overflow-hidden rounded-sm drop-shadow-sm">
        {avatarUrl && avatarUrl.startsWith('http') ? (
          <Image
            src={avatarUrl}
            alt="Workspace Icon"
            width={20}
            height={20}
            className="object-contain"
          />
        ) : (
          <span className="text-[14px] leading-none">{avatarUrl || '👋'}</span>
        )}
      </div>

      <EditableText
        as="span"
        value={initialTitle}
        onSave={(newTitle) => triggerSave(() => updateProfile(profileId, { site_title: newTitle }))}
        isEditing={true}
        singleLine
        className="text-notion-text hover:bg-surface-border/50 -ml-1 truncate rounded px-1 text-[14px] font-medium transition-colors outline-none"
        placeholder="Hey there, I'm Owner!"
      />
    </div>
  )
}
