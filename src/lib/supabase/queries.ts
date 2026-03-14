import { createClient as createServerClient } from '@/lib/supabase/server'
import type { Profile, Collection, Project, Page } from '@/lib/types'

export async function getProfile(): Promise<Profile | null> {
  const supabase = await createServerClient()
  const { data } = await supabase.from('profile').select('*').limit(1).maybeSingle()

  return data as Profile | null
}

export async function getCollectionsWithProjects(): Promise<
  Array<Collection & { projects: Project[] }>
> {
  const supabase = await createServerClient()
  const { data } = await supabase
    .from('collections')
    .select(`*, projects(*)`)
    .order('position')
    .order('position', { referencedTable: 'projects' })

  return (data ?? []) as Array<Collection & { projects: Project[] }>
}

export async function getPage(slug: string): Promise<Page | null> {
  const supabase = await createServerClient()
  const { data } = await supabase.from('pages').select('*').eq('slug', slug).limit(1).maybeSingle()
  return data as Page | null
}
