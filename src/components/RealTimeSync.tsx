'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient as createBrowserClient } from '@/lib/supabase/client'

export function RealtimeSync() {
  const router = useRouter()

  useEffect(() => {
    const supabase = createBrowserClient()

    // Subscribe to ALL changes in the public schema
    const channel = supabase
      .channel('global-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public' }, (payload) => {
        console.log('Realtime Update Received:', payload)
        // ✅ This magically re-fetches Server Components in the background!
        router.refresh()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [router])

  return null // This component renders absolutely nothing!
}
