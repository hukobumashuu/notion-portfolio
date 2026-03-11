'use client'

import { useState } from 'react'
import { createClient as createBrowserClient } from '@/lib/supabase/client'
import { env } from '@/lib/env'

type FormState = 'idle' | 'loading' | 'success' | 'error'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [state, setState] = useState<FormState>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const supabase = createBrowserClient()

  async function handleSubmit() {
    if (!email) return
    setState('loading')
    setErrorMessage('')

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${env.NEXT_PUBLIC_APP_URL}/auth/confirm?next=/editor`,
      },
    })

    if (error) {
      setState('error')
      setErrorMessage(error.message)
      return
    }

    setState('success')
  }

  if (state === 'success') {
    return (
      <div className="rounded-card border-surface-border bg-surface-card border p-6 text-center">
        <p className="text-teal font-medium">Check your email ✓</p>
        <p className="text-text-muted mt-2 text-sm">
          Magic link sent to <strong className="text-text-primary">{email}</strong>
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-card border-surface-border bg-surface-card border p-6">
      <div className="space-y-4">
        <div>
          <label htmlFor="email" className="text-text-muted mb-1.5 block text-sm">
            Email address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            placeholder="you@example.com"
            disabled={state === 'loading'}
            className="border-surface-border bg-surface text-text-primary placeholder:text-text-muted focus:border-teal w-full rounded-lg border px-4 py-2.5 text-sm focus:outline-none disabled:opacity-50"
          />
        </div>

        {state === 'error' && <p className="text-sm text-red-400">{errorMessage}</p>}

        <button
          onClick={handleSubmit}
          disabled={state === 'loading' || !email}
          className="bg-teal text-surface w-full rounded-lg px-4 py-2.5 text-sm font-medium transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {state === 'loading' ? 'Sending...' : 'Send magic link'}
        </button>
      </div>
    </div>
  )
}
