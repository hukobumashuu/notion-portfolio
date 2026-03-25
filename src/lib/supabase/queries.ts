import { cache } from 'react' // ✅ Import React's powerful caching utility
import { createClient as createServerClient } from '@/lib/supabase/server'
import type { Profile, Collection, Project, Page } from '@/lib/types'

// ✅ Wrap every function in cache() to eliminate the Double Fetch!
export const getProfile = cache(async (): Promise<Profile | null> => {
  const supabase = await createServerClient()
  const { data } = await supabase.from('profile').select('*').limit(1).maybeSingle()

  return data as Profile | null
})

export const getCollectionsWithProjects = cache(
  async (): Promise<Array<Collection & { projects: Project[] }>> => {
    const supabase = await createServerClient()
    const { data } = await supabase
      .from('collections')
      .select(`*, projects(*)`)
      .order('position')
      .order('position', { referencedTable: 'projects' })

    return (data ?? []) as Array<Collection & { projects: Project[] }>
  },
)

export const getPage = cache(async (slug: string): Promise<Page | null> => {
  const supabase = await createServerClient()
  const { data } = await supabase.from('pages').select('*').eq('slug', slug).limit(1).maybeSingle()
  return data as Page | null
})

export const getPages = cache(async (): Promise<Page[]> => {
  const supabase = await createServerClient()
  const { data } = await supabase
    .from('pages')
    .select('*')
    .order('created_at', { ascending: false })
  return (data ?? []) as Page[]
})

export const getCollectionById = cache(
  async (id: string): Promise<(Collection & { projects: Project[] }) | null> => {
    const supabase = await createServerClient()
    const { data } = await supabase
      .from('collections')
      .select(`*, projects(*)`)
      .eq('id', id)
      .order('position', { referencedTable: 'projects' })
      .limit(1)
      .maybeSingle()

    return data as (Collection & { projects: Project[] }) | null
  },
)
