'use client'

import Image from 'next/image'
import type { Profile } from '@/lib/types'
import { EditableText } from '@/components/editor/EditableText'
import { useSaveStatus } from '@/lib/context/SaveStatusContext'
import { updateProfile } from '@/lib/supabase/mutations'
import { ImageUpload } from '@/components/editor/ImageUpload'
import { CalloutLinks } from './CallOutLinks'
import { NotionEditorWrapper } from '@/components/editor/NotionEditorWrapper'
import { EmojiPickerModal } from '@/components/editor/EmojiPickerModal'

interface HeroSectionProps {
  profile: Profile | null
  isEditing?: boolean
}

export function HeroSection({ profile, isEditing = false }: HeroSectionProps) {
  const { triggerSave } = useSaveStatus()

  const name = profile?.name ?? "Hey there, I'm Owner!"
  const avatarUrl = profile?.avatar_url
  const coverUrl = profile?.cover_url

  function handleSave(field: keyof Pick<Profile, 'name'>) {
    return (value: string) => {
      if (!profile) return
      triggerSave(() => updateProfile(profile.id, { [field]: value }))
    }
  }

  const showCover = isEditing || !!coverUrl

  return (
    <section className="contents">
      {/* --- COVER IMAGE (FULL BLEED) --- */}
      {showCover && (
        <div className="notion-full-width group border-notion-border bg-notion-bg-hover relative h-48 w-full overflow-hidden border-b md:h-[30vh]">
          {isEditing ? (
            <ImageUpload
              bucket="covers"
              path="profile_cover"
              onUpload={(url) => triggerSave(() => updateProfile(profile!.id, { cover_url: url }))}
              className="h-full w-full"
            >
              {coverUrl ? (
                <Image
                  src={coverUrl}
                  alt="Cover"
                  fill
                  className="object-cover object-[center_50%]"
                />
              ) : (
                <div className="text-notion-text-muted flex h-full w-full items-center justify-center">
                  <span className="text-sm font-medium">Click to upload cover image</span>
                </div>
              )}
              <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/40">
                <span className="text-sm font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
                  Change Cover
                </span>
              </div>
            </ImageUpload>
          ) : (
            <Image src={coverUrl!} alt="Cover" fill className="object-cover object-[center_50%]" />
          )}
        </div>
      )}

      {/* --- HERO CONTENT (CONSTRAINED) --- */}
      <div className="notion-content text-notion-text flex w-full flex-col items-start pt-2">
        {/* Avatar & Title Block */}
        <div
          className={`relative z-10 flex w-full flex-col ${showCover ? '-mt-12 md:-mt-16' : 'pt-4 md:pt-8'}`}
        >
          {/* --- AVATAR BLOCK (Upgraded for Alpha Transparency) --- */}
          <div className="group/avatar relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg md:h-32 md:w-32">
            {avatarUrl && avatarUrl.startsWith('http') ? (
              <Image
                src={avatarUrl}
                alt={name}
                fill
                className="object-contain drop-shadow-sm"
                sizes="128px"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-[5rem] md:text-[6.5rem]">
                {avatarUrl || '👋'}
              </div>
            )}

            {isEditing && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 opacity-0 transition-opacity group-hover/avatar:opacity-100">
                <div className="flex h-1/2 w-full items-center justify-center transition-colors hover:bg-white/20">
                  <ImageUpload
                    bucket="avatars"
                    path="avatar"
                    onUpload={(url) =>
                      triggerSave(() => updateProfile(profile!.id, { avatar_url: url }))
                    }
                    className="flex h-full w-full items-center justify-center"
                  >
                    <span className="text-xs font-medium text-white">📷 Image</span>
                  </ImageUpload>
                </div>

                <div className="h-px w-full bg-white/20" />

                {/* ✅ Upgraded Emoji Input Half */}
                <EmojiPickerModal
                  onEmojiSelect={(emoji) =>
                    triggerSave(() => updateProfile(profile!.id, { avatar_url: emoji }))
                  }
                  className="flex h-1/2 w-full cursor-pointer items-center justify-center transition-colors hover:bg-white/20"
                >
                  <span className="text-xs font-medium text-white">😀 Emoji</span>
                </EmojiPickerModal>
              </div>
            )}
          </div>

          <div className="mt-4 mb-2">
            <EditableText
              as="h1"
              value={name}
              onSave={handleSave('name')}
              isEditing={isEditing}
              singleLine
              className="text-notion-text text-[32px] leading-[1.2] font-bold tracking-tight md:text-[40px]"
              placeholder="Your name..."
            />
          </div>
        </div>

        {/* --- THE 50/50 CORE SPLIT ROW (RESTORED!) --- */}
        <div className="flex w-full flex-col gap-11.5 md:flex-row">
          {/* LEFT COLUMN: Bio (Now powered by BlockNote!) */}
          <div className="flex w-full shrink-0 grow-0 flex-col py-3 md:w-[calc(50%-23px)]">
            <div className="w-full">
              <NotionEditorWrapper
                initialContent={profile?.hero_content}
                isEditing={isEditing}
                // ✅ Explicitly typed as unknown to fix the TS error
                onSave={(content: unknown) => {
                  if (profile)
                    triggerSave(() => updateProfile(profile.id, { hero_content: content }))
                }}
              />
            </div>
          </div>

          {/* RIGHT COLUMN: Action Card */}
          <div className="flex w-full shrink-0 grow-0 flex-col py-3 md:w-[calc(50%-23px)]">
            <div className="bg-notion-border-strong flex min-h-8 w-full flex-col rounded-[10px] border border-transparent p-1.5">
              <CalloutLinks profile={profile} isEditing={isEditing} />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
