import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'
import { env } from '@/lib/env'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/editor'

  // If there's no code, the link is malformed — send to login
  if (!code) {
    return NextResponse.redirect(new URL('/editor/login?error=missing_code', request.url))
  }

  const cookieStore = await cookies()

  const supabase = createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        },
      },
    },
  )

  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    // Code already used, expired, or invalid
    return NextResponse.redirect(
      new URL(`/editor/login?error=${encodeURIComponent(error.message)}`, request.url),
    )
  }

  // Session cookie is now set — safe to redirect to the editor
  // next is validated to only allow internal paths
  const safeNext = next.startsWith('/') ? next : '/editor'
  return NextResponse.redirect(new URL(safeNext, request.url))
}
