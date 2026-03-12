import Image from 'next/image'
import type { Profile } from '@/lib/types'

interface HeroSectionProps {
  profile: Profile | null
  _isEditing?: boolean
}

export function HeroSection({ profile }: HeroSectionProps) {
  const name = profile?.name ?? 'Hey there 👋'
  const role = profile?.role ?? 'your role'
  const bio = profile?.bio ?? 'A short bio about yourself.'
  const avatarUrl = profile?.avatar_url

  return (
    <section className="flex items-start gap-6">
      {/* Avatar */}
      <div className="bg-surface-card relative h-20 w-20 shrink-0 overflow-hidden rounded-full">
        {avatarUrl ? (
          <Image src={avatarUrl} alt={name} fill className="object-cover" sizes="80px" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-3xl">🧑‍💻</div>
        )}
      </div>

      {/* Text */}
      <div className="flex-1">
        <h1 className="text-text-primary text-3xl font-bold">{name}</h1>
        <p className="text-text-muted mt-2">
          A <span className="text-teal font-medium">{role}</span>
          {bio.startsWith('A') ? bio.slice(1) : ` — ${bio}`}
        </p>
      </div>
    </section>
  )
}
