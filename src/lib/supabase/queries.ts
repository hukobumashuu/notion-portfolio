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

// Fetch a single page by slug
export async function getPage(slug: string): Promise<Page | null> {
  const supabase = await createServerClient()
  const { data } = await supabase.from('pages').select('*').eq('slug', slug).limit(1).maybeSingle()
  return data as Page | null
}

// Fetch all pages for the dashboard
export async function getPages(): Promise<Page[]> {
  const supabase = await createServerClient()
  const { data } = await supabase
    .from('pages')
    .select('*')
    .order('created_at', { ascending: false })
  return (data ?? []) as Page[]
}
