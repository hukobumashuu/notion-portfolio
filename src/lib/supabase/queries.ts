import { createServerClient } from '@/lib/supabase'
import type { Collection, ContentBlock, Profile, Project } from '@/lib/types'

export async function getProfile(): Promise<Profile | null> {
  const supabase = await createServerClient()

  const { data, error } = await supabase.from('profile').select('*').single()

  if (error) {
    console.error('[getProfile]', error.message)
    return null
  }

  return data
}

export async function getCollections(): Promise<Collection[]> {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from('collections')
    .select('*')
    .order('position', { ascending: true })

  if (error) {
    console.error('[getCollections]', error.message)
    return []
  }

  return data
}

export async function getProjectsByCollection(collectionId: string): Promise<Project[]> {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('collection_id', collectionId)
    .order('position', { ascending: true })

  if (error) {
    console.error('[getProjectsByCollection]', error.message)
    return []
  }

  return data
}

export async function getContentBlocks(projectId: string): Promise<ContentBlock[]> {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from('content_blocks')
    .select('*')
    .eq('project_id', projectId)
    .order('position', { ascending: true })

  if (error) {
    console.error('[getContentBlocks]', error.message)
    return []
  }

  return data
}

// Fetches all collections with their projects in one page load
// Used only in the public page and editor page — not in individual components
export async function getCollectionsWithProjects(): Promise<
  Array<Collection & { projects: Project[] }>
> {
  const collections = await getCollections()

  const withProjects = await Promise.all(
    collections.map(async (collection) => ({
      ...collection,
      projects: await getProjectsByCollection(collection.id),
    })),
  )

  return withProjects
}
