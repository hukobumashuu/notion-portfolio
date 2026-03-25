import { createBrowserClient } from '@supabase/ssr'
import { env } from '@/lib/env'
import type { Profile, Project, ContentBlock, ContentBlockType } from '@/lib/types'

// Untyped client — our function signatures are the external type contract.
// The manually-written Database interface doesn't satisfy Supabase's internal
// Json constraints, so we bypass the generic here and type at the function level.
function getClient() {
  return createBrowserClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export async function revalidatePublicPage(): Promise<void> {
  await fetch(`${env.NEXT_PUBLIC_APP_URL}/api/revalidate`, {
    method: 'POST',
  })
}

// ─── Profile ──────────────────────────────────────────────────────────────────

type ProfileUpdate = Partial<
  Pick<
    Profile,
    | 'name'
    | 'role'
    | 'bio'
    | 'avatar_url'
    | 'cover_url'
    | 'custom_links'
    | 'site_title'
    | 'hero_content'
  >
>

export async function updateProfile(id: string, fields: ProfileUpdate): Promise<void> {
  const supabase = getClient()
  const { error } = await supabase.from('profile').update(fields).eq('id', id)
  if (error) throw new Error(error.message)
  await revalidatePublicPage()
}

// ─── Projects ─────────────────────────────────────────────────────────────────

type ProjectUpdate = Partial<
  Pick<
    Project,
    | 'title'
    | 'emoji'
    | 'status'
    | 'duration'
    | 'sector_tags'
    | 'tool_tags'
    | 'thumbnail_url'
    | 'position'
    | 'content'
  >
>

export async function updateProject(id: string, fields: ProjectUpdate): Promise<void> {
  const supabase = getClient()
  const { error } = await supabase.from('projects').update(fields).eq('id', id)
  if (error) throw new Error(error.message)
  await revalidatePublicPage()
}

// ─── Content Blocks ───────────────────────────────────────────────────────────

type ContentBlockUpdate = Partial<Pick<ContentBlock, 'content' | 'type' | 'position'>>

export async function updateContentBlock(id: string, fields: ContentBlockUpdate): Promise<void> {
  const supabase = getClient()
  const { error } = await supabase.from('content_blocks').update(fields).eq('id', id)
  if (error) throw new Error(error.message)
  await revalidatePublicPage()
}

export async function addContentBlock(
  projectId: string,
  type: ContentBlockType,
  position: number,
): Promise<void> {
  const supabase = getClient()
  const { error } = await supabase.from('content_blocks').insert({
    project_id: projectId,
    type,
    content: '',
    position,
  })
  if (error) throw new Error(error.message)
  await revalidatePublicPage()
}

export async function deleteContentBlock(id: string): Promise<void> {
  const supabase = getClient()
  const { error } = await supabase.from('content_blocks').delete().eq('id', id)
  if (error) throw new Error(error.message)
  await revalidatePublicPage()
}

export async function addProject(collectionId: string, position: number): Promise<string> {
  const supabase = getClient()
  const { data, error } = await supabase
    .from('projects')
    .insert({
      collection_id: collectionId,
      title: 'Untitled Project',
      emoji: '📄',
      position,
      status: 'In Progress',
      sector_tags: [],
      tool_tags: [],
    })
    .select('id')
    .single()

  if (error) throw new Error(error.message)
  await revalidatePublicPage()
  return data.id
}

export async function deleteProject(id: string): Promise<void> {
  const supabase = getClient()
  const { error } = await supabase.from('projects').delete().eq('id', id)
  if (error) throw new Error(error.message)
  await revalidatePublicPage()
}

export async function updateCollection(id: string, title: string): Promise<void> {
  const supabase = getClient()
  const { error } = await supabase.from('collections').update({ title }).eq('id', id)
  if (error) throw new Error(error.message)
  await revalidatePublicPage()
}

export async function addCollection(position: number): Promise<void> {
  const supabase = getClient()
  const { error } = await supabase.from('collections').insert({ title: 'New Section', position })
  if (error) throw new Error(error.message)
  await revalidatePublicPage()
}

export async function deleteCollection(id: string): Promise<void> {
  const supabase = getClient()
  const { error } = await supabase.from('collections').delete().eq('id', id)
  if (error) throw new Error(error.message)
  await revalidatePublicPage()
}

// --- Pages (BlockNote) ---

export async function updatePage(slug: string, content: unknown): Promise<void> {
  const supabase = getClient()
  const { error } = await supabase.from('pages').update({ content }).eq('slug', slug)
  if (error) throw new Error(error.message)
  await revalidatePublicPage()
}

export async function updatePageTitle(slug: string, title: string): Promise<void> {
  const supabase = getClient()
  const { error } = await supabase.from('pages').update({ title }).eq('slug', slug)
  if (error) throw new Error(error.message)
  await revalidatePublicPage()
}

export async function addPage(): Promise<string> {
  const supabase = getClient()
  const newSlug = `untitled-${Date.now()}` // Generate a simple unique slug
  const { error } = await supabase
    .from('pages')
    .insert({ slug: newSlug, title: 'Untitled Page', content: [] })
  if (error) throw new Error(error.message)
  await revalidatePublicPage()
  return newSlug
}

export async function deletePage(slug: string): Promise<void> {
  const supabase = getClient()
  // ✅ Added safety check: only delete if is_protected is false or null
  const { error } = await supabase.from('pages').delete().match({ slug, is_protected: false })
  if (error) throw new Error(error.message)
  await revalidatePublicPage()
}

export async function updatePageSlug(oldSlug: string, newSlug: string): Promise<void> {
  const supabase = getClient()

  // Sanitize the slug (lowercase, replace spaces with hyphens, remove special chars)
  const sanitizedSlug = newSlug
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')

  if (sanitizedSlug === oldSlug) return // No change needed
  if (!sanitizedSlug) throw new Error('Slug cannot be empty')

  const { error } = await supabase.from('pages').update({ slug: sanitizedSlug }).eq('slug', oldSlug)

  if (error) {
    // Supabase unique constraint violation code is usually '23505'
    if (error.code === '23505') {
      throw new Error('This URL is already taken by another page.')
    }
    throw new Error(error.message)
  }

  await revalidatePublicPage()
}
