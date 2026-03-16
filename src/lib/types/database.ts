export type ToolTag = {
  label: string
  color: string
}

export type CustomLink = {
  id: string
  label: string
  url: string
  emoji: string
}

export type ContentBlockType = 'heading' | 'subheading' | 'paragraph' | 'blockquote'

export interface Database {
  public: {
    Tables: {
      profile: {
        Row: {
          id: string
          name: string
          role: string
          bio: string | null
          avatar_url: string | null
          updated_at: string
          cover_url: string | null
          custom_links: CustomLink[] | null
        }
        Insert: Omit<Database['public']['Tables']['profile']['Row'], 'id' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['profile']['Insert']>
      }
      pages: {
        Row: {
          id: string
          slug: string
          title: string
          content: unknown
          is_protected: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<
          Database['public']['Tables']['pages']['Row'],
          'id' | 'created_at' | 'updated_at'
        >
        Update: Partial<Database['public']['Tables']['pages']['Insert']>
      }
      collections: {
        Row: {
          id: string
          title: string
          position: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['collections']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['collections']['Insert']>
      }
      projects: {
        Row: {
          id: string
          collection_id: string
          title: string
          emoji: string | null
          thumbnail_url: string | null
          status: string | null
          duration: string | null
          sector_tags: string[]
          tool_tags: ToolTag[]
          position: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['projects']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['projects']['Insert']>
      }
      content_blocks: {
        Row: {
          id: string
          project_id: string
          type: ContentBlockType
          content: string | null
          position: number
        }
        Insert: Omit<Database['public']['Tables']['content_blocks']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['content_blocks']['Insert']>
      }
    }
  }
}

// Convenience row types — use these everywhere
export type Profile = Database['public']['Tables']['profile']['Row']
export type Collection = Database['public']['Tables']['collections']['Row']
export type Project = Database['public']['Tables']['projects']['Row']
export type ContentBlock = Database['public']['Tables']['content_blocks']['Row']
export type Page = Database['public']['Tables']['pages']['Row']
