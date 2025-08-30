import { createBrowserClient } from '@supabase/ssr'

// Supabase client for browser-side operations
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables:', {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseAnonKey
    })
    throw new Error(
      'Missing Supabase environment variables. Please check your .env.local file.'
    )
  }

  return createBrowserClient<Database>(
    supabaseUrl,
    supabaseAnonKey
  )
}

// Singleton instance for client-side usage
let supabaseInstance: ReturnType<typeof createClient> | null = null

export function getSupabaseClient() {
  if (!supabaseInstance) {
    try {
      supabaseInstance = createClient()
    } catch (error) {
      console.error('Failed to create Supabase client:', error)
      throw error
    }
  }
  return supabaseInstance
}

export const supabase = getSupabaseClient()

// Re-export the Database type for other modules
export type { Database }

// Database types (will be generated from schema)
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          display_name: string | null
          avatar_url: string | null
          bio: string | null
          website: string | null
          plan: 'free' | 'pro'
          settings: any
          is_email_verified: boolean
          last_login: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          display_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          website?: string | null
          plan?: 'free' | 'pro'
          settings?: any
          is_email_verified?: boolean
          last_login?: string | null
        }
        Update: {
          display_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          website?: string | null
          plan?: 'free' | 'pro'
          settings?: any
          is_email_verified?: boolean
          last_login?: string | null
        }
      }
      pages: {
        Row: {
          id: string
          user_id: string
          slug: string
          domain: string | null
          title: string
          description: string | null
          theme: string
          custom_css: string | null
          status: 'draft' | 'published' | 'archived'
          is_public: boolean
          seo_settings: any
          social_links: any
          published_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          slug: string
          domain?: string | null
          title?: string
          description?: string | null
          theme?: string
          custom_css?: string | null
          status?: 'draft' | 'published' | 'archived'
          is_public?: boolean
          seo_settings?: any
          social_links?: any
        }
        Update: {
          slug?: string
          domain?: string | null
          title?: string
          description?: string | null
          theme?: string
          custom_css?: string | null
          status?: 'draft' | 'published' | 'archived'
          is_public?: boolean
          seo_settings?: any
          social_links?: any
          published_at?: string | null
        }
      }
      blocks: {
        Row: {
          id: string
          page_id: string
          type: string
          position: number
          config: any
          created_at: string
          updated_at: string
        }
        Insert: {
          page_id: string
          type: string
          position?: number
          config?: any
        }
        Update: {
          type?: string
          position?: number
          config?: any
        }
      }
      links: {
        Row: {
          id: string
          page_id: string
          title: string
          url: string
          description: string | null
          thumbnail_url: string | null
          group_name: string | null
          position: number
          is_active: boolean
          click_count: number
          schedule: any
          deep_link_config: any
          created_at: string
          updated_at: string
        }
        Insert: {
          page_id: string
          title: string
          url: string
          description?: string | null
          thumbnail_url?: string | null
          group_name?: string | null
          position?: number
          is_active?: boolean
          schedule?: any
          deep_link_config?: any
        }
        Update: {
          title?: string
          url?: string
          description?: string | null
          thumbnail_url?: string | null
          group_name?: string | null
          position?: number
          is_active?: boolean
          click_count?: number
          schedule?: any
          deep_link_config?: any
        }
      }
      templates: {
        Row: {
          id: string
          name: string
          description: string | null
          preview_image: string | null
          category: string
          is_premium: boolean
          blocks: any
          theme: string
          created_at: string
        }
        Insert: {
          name: string
          description?: string | null
          preview_image?: string | null
          category: string
          is_premium?: boolean
          blocks?: any
          theme?: string
        }
        Update: {
          name?: string
          description?: string | null
          preview_image?: string | null
          category?: string
          is_premium?: boolean
          blocks?: any
          theme?: string
        }
      }
      themes: {
        Row: {
          id: string
          name: string
          colors: any
          fonts: any
          spacing: any
          is_premium: boolean
          created_at: string
        }
        Insert: {
          name: string
          colors: any
          fonts: any
          spacing: any
          is_premium?: boolean
        }
        Update: {
          name?: string
          colors?: any
          fonts?: any
          spacing?: any
          is_premium?: boolean
        }
      }
      analytics_events: {
        Row: {
          id: string
          page_id: string
          link_id: string | null
          event_type: string
          timestamp: string
          user_agent: string | null
          ip_address: string | null
          referrer: string | null
          device: any
          geo: any
        }
        Insert: {
          page_id: string
          link_id?: string | null
          event_type: string
          user_agent?: string | null
          ip_address?: string | null
          referrer?: string | null
          device?: any
          geo?: any
        }
        Update: {
          event_type?: string
          user_agent?: string | null
          ip_address?: string | null
          referrer?: string | null
          device?: any
          geo?: any
        }
      }
      integrations: {
        Row: {
          id: string
          page_id: string
          type: string
          config: any
          status: string
          last_sync: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          page_id: string
          type: string
          config?: any
          status?: string
        }
        Update: {
          type?: string
          config?: any
          status?: string
          last_sync?: string | null
        }
      }
      payments: {
        Row: {
          id: string
          page_id: string
          stripe_payment_intent_id: string | null
          stripe_customer_id: string | null
          amount: number
          currency: string
          status: string
          payer_email: string | null
          payer_name: string | null
          created_at: string
          completed_at: string | null
        }
        Insert: {
          page_id: string
          stripe_payment_intent_id?: string | null
          stripe_customer_id?: string | null
          amount: number
          currency?: string
          status?: string
          payer_email?: string | null
          payer_name?: string | null
          completed_at?: string | null
        }
        Update: {
          stripe_payment_intent_id?: string | null
          stripe_customer_id?: string | null
          amount?: number
          currency?: string
          status?: string
          payer_email?: string | null
          payer_name?: string | null
          completed_at?: string | null
        }
      }
      form_submissions: {
        Row: {
          id: string
          page_id: string
          form_type: string
          data: any
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          page_id: string
          form_type: string
          data: any
          ip_address?: string | null
          user_agent?: string | null
        }
        Update: {
          form_type?: string
          data?: any
          ip_address?: string | null
          user_agent?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_unique_slug: {
        Args: { base_slug: string; user_id: string }
        Returns: string
      }
      get_public_page_by_slug: {
        Args: { page_slug: string }
        Returns: {
          id: string
          title: string
          description: string | null
          theme: string
          custom_css: string | null
          seo_settings: any
          social_links: any
          blocks: any
          links: any
        }[]
      }
      increment_link_click: {
        Args: { link_uuid: string }
        Returns: undefined
      }
      create_analytics_event: {
        Args: {
          page_uuid: string
          link_uuid?: string
          event_type: string
          user_agent?: string
          ip_address?: string
          referrer?: string
          device_data?: any
          geo_data?: any
        }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}
