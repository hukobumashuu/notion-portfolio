'use client'

import Image from 'next/image'
import type { Profile } from '@/lib/types'
import { EditableText } from '@/components/editor/EditableText'
import { useSaveStatus } from '@/lib/context/SaveStatusContext'
import { updateProfile } from '@/lib/supabase/mutations' // ✅ not queries.ts
import { ImageUpload } from '@/components/editor/ImageUpload'
interface HeroSectionProps {
  profile: Profile | null
  isEditing?: boolean
}

export function HeroSection({ profile, isEditing = false }: HeroSectionProps) {
  const { triggerSave } = useSaveStatus()

  const name = profile?.name ?? 'Hey there 👋'
  const role = profile?.role ?? 'your role'
  const bio = profile?.bio ?? 'with a passion for something great.'
  const avatarUrl = profile?.avatar_url

  function handleSave(field: keyof Pick<Profile, 'name' | 'role' | 'bio'>) {
    return (value: string) => {
      if (!profile) return
      triggerSave(() => updateProfile(profile.id, { [field]: value }))
    }
  }

  return (
    <section className="flex items-start gap-6">
      {/* Avatar */}
      <div className="bg-surface-card relative h-20 w-20 shrink-0 overflow-hidden rounded-full">
        {isEditing ? (
          <ImageUpload
            bucket="avatars"
            path="avatar"
            onUpload={(url) => triggerSave(() => updateProfile(profile!.id, { avatar_url: url }))}
            className="h-full w-full rounded-full"
          >
            {avatarUrl ? (
              <Image src={avatarUrl} alt={name} fill className="object-cover" sizes="80px" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-3xl">🧑‍💻</div>
            )}
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/0 transition-colors hover:bg-black/50">
              <span className="text-lg opacity-0 transition-opacity hover:opacity-100">📷</span>
            </div>
          </ImageUpload>
        ) : avatarUrl ? (
          <Image src={avatarUrl} alt={name} fill className="object-cover" sizes="80px" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-3xl">🧑‍💻</div>
        )}
      </div>

      {/* Text */}
      <div className="flex-1">
        <EditableText
          as="h1"
          value={name}
          onSave={handleSave('name')}
          isEditing={isEditing}
          singleLine
          className="text-text-primary text-3xl font-bold"
          placeholder="Your name..."
        />
        <p className="text-text-muted mt-2">
          {'A '}
          <EditableText
            as="span"
            value={role}
            onSave={handleSave('role')}
            isEditing={isEditing}
            singleLine
            className="text-teal font-medium"
            placeholder="your role"
          />{' '}
          <EditableText
            as="span"
            value={bio}
            onSave={handleSave('bio')}
            isEditing={isEditing}
            className="text-text-muted"
            placeholder="with a passion for..."
          />
        </p>
      </div>
    </section>
  )
}
