'use client'

import Image from 'next/image'
import type { Profile } from '@/lib/types'
import { EditableText } from '@/components/editor/EditableText'
import { useSaveStatus } from '@/lib/context/SaveStatusContext'
import { updateProfile } from '@/lib/supabase/mutations'
import { ImageUpload } from '@/components/editor/ImageUpload'
import { CalloutLinks } from './CallOutLinks'

interface HeroSectionProps {
  profile: Profile | null
  isEditing?: boolean
}

export function HeroSection({ profile, isEditing = false }: HeroSectionProps) {
  const { triggerSave } = useSaveStatus()

  const name = profile?.name ?? "Hey there, I'm Kristhia!"
  const role = profile?.role ?? 'data analyst'
  const bio =
    profile?.bio ??
    'with a background in research and project management, transforming complex data into actionable insights.'
  const avatarUrl = profile?.avatar_url
  const coverUrl = profile?.cover_url

  function handleSave(field: keyof Pick<Profile, 'name' | 'role' | 'bio'>) {
    return (value: string) => {
      if (!profile) return
      triggerSave(() => updateProfile(profile.id, { [field]: value }))
    }
  }

  const showCover = isEditing || !!coverUrl

  return (
    // 'contents' allows the children to directly participate in the parent's CSS Grid
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
          {/* Avatar */}
          <div className="bg-notion-bg relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg shadow-sm md:h-32 md:w-32">
            {isEditing ? (
              <ImageUpload
                bucket="avatars"
                path="avatar"
                onUpload={(url) =>
                  triggerSave(() => updateProfile(profile!.id, { avatar_url: url }))
                }
                className="h-full w-full"
              >
                {avatarUrl ? (
                  <Image src={avatarUrl} alt={name} fill className="object-cover" sizes="128px" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-5xl">👋</div>
                )}
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity hover:opacity-100">
                  <span className="text-xl">📷</span>
                </div>
              </ImageUpload>
            ) : avatarUrl ? (
              <Image src={avatarUrl} alt={name} fill className="object-cover" sizes="128px" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-5xl">👋</div>
            )}
          </div>

          {/* Title */}
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

        {/* --- THE 50/50 CORE SPLIT ROW --- */}
        <div className="flex w-full flex-col gap-11.5 md:flex-row">
          {/* LEFT COLUMN: Bio */}
          <div className="flex w-full shrink-0 grow-0 flex-col py-3 md:w-[calc(50%-23px)]">
            <p className="m-0 px-1.5 pt-5.5 text-[1.25em] leading-[1.3] font-semibold wrap-break-word whitespace-pre-wrap">
              {'A '}
              <EditableText
                as="span"
                value={role}
                onSave={handleSave('role')}
                isEditing={isEditing}
                singleLine
                className="text-notion-green font-semibold"
                placeholder="data analyst"
              />{' '}
              <EditableText
                as="span"
                value={bio}
                onSave={handleSave('bio')}
                isEditing={isEditing}
                className="text-notion-text-muted"
                placeholder="with a background in..."
              />
            </p>
          </div>

          {/* RIGHT COLUMN: Action Card */}
          <div className="flex w-full shrink-0 grow-0 flex-col py-3 md:w-[calc(50%-23px)]">
            {/* ✅ Reduced padding from p-3 to p-1.5 here! */}
            <div className="bg-notion-border-strong flex min-h-8 w-full flex-col rounded-[10px] border border-transparent p-1.5">
              <CalloutLinks profile={profile} isEditing={isEditing} />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
