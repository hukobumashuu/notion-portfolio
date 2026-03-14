'use client'

import Image from 'next/image'
import Link from 'next/link'
import type { Profile } from '@/lib/types'
import { EditableText } from '@/components/editor/EditableText'
import { useSaveStatus } from '@/lib/context/SaveStatusContext'
import { updateProfile } from '@/lib/supabase/mutations'
import { ImageUpload } from '@/components/editor/ImageUpload'

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

  // ✅ Smarter Cover Logic: Only show the cover area if an image exists OR we are in the editor
  const showCover = isEditing || !!coverUrl

  return (
    <section className="relative flex w-full flex-col items-center">
      {/* --- COVER IMAGE COMPONENT --- */}
      {showCover && (
        <div className="bg-surface-card border-surface-border group relative h-48 w-screen overflow-hidden border-b md:h-64">
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
                // ✅ Replaced the Teal Gradient with a clean, neutral grey placeholder for the Editor
                <div className="text-text-muted flex h-full w-full items-center justify-center">
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
            // Public view when cover exists
            <Image src={coverUrl!} alt="Cover" fill className="object-cover object-[center_50%]" />
          )}
        </div>
      )}

      {/* --- HERO CONTENT --- */}
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-1 flex-col items-start text-left">
          {/* ✅ Dynamic Margin: -mt overlaps the cover. If no cover (public), it uses standard padding instead! */}
          <div
            className={`relative z-10 flex items-end gap-4 md:gap-6 ${showCover ? '-mt-12 md:-mt-16' : 'pt-4 md:pt-8'}`}
          >
            {/* Avatar */}
            <div className="bg-surface-card border-surface-border relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border shadow-sm md:h-32 md:w-32">
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
                    <div className="flex h-full w-full items-center justify-center text-5xl">
                      👋
                    </div>
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
            <EditableText
              as="h1"
              value={name}
              onSave={handleSave('name')}
              isEditing={isEditing}
              singleLine
              className="text-text-primary pb-1 text-3xl font-bold tracking-tight md:pb-2 md:text-5xl"
              placeholder="Your name..."
            />
          </div>

          <div className="mt-6 max-w-2xl">
            <p className="text-text-primary text-base leading-relaxed md:text-lg">
              {'A '}
              <EditableText
                as="span"
                value={role}
                onSave={handleSave('role')}
                isEditing={isEditing}
                singleLine
                className="font-semibold text-[#46a171]" // ✅ Switched to Notion's exact native green highlight
                placeholder="data analyst"
              />{' '}
              <EditableText
                as="span"
                value={bio}
                onSave={handleSave('bio')}
                isEditing={isEditing}
                className="text-text-muted"
                placeholder="with a background in..."
              />
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: Action Card */}
        <div className="w-full shrink-0 md:w-65 lg:w-70">
          <div className="bg-surface-card border-surface-border flex w-full flex-col rounded-xl border p-2 shadow-sm">
            <Link
              href="/about"
              className="hover:bg-surface-border/50 text-text-primary flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors"
            >
              <span className="text-lg">👩‍💻</span>
              More about me
            </Link>
            <Link
              href="/contact"
              className="hover:bg-surface-border/50 text-text-primary flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors"
            >
              <span className="text-lg">📫</span>
              Contact
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
