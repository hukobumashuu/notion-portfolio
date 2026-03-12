import { createClient as createServerClient } from '@/lib/supabase/server'

export async function getProfile() {
  const supabase = await createServerClient()
  const { data } = await supabase.from('profile').select('*').limit(1).maybeSingle()
  return data
}

export async function getCollectionsWithProjects() {
  const supabase = await createServerClient()
  const { data } = await supabase
    .from('collections')
    .select(`*, projects(*)`)
    .order('position')
    .order('position', { referencedTable: 'projects' })
  return data ?? []
}
