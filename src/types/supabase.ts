export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      services: {
        Row: {
          id: string
          slug: string
          name: string
          category: string
          short_description: string | null
          long_description: string | null
          hero_image_url: string | null
          og_image_url: string | null
          meta_title: string | null
          meta_description: string | null
          benefits: Json
          faq: Json
          pre_instructions: Json
          post_instructions: Json
          related_service_ids: string[]
          planway_service_id: string | null
          planway_staff_id: string | null
          display_order: number
          is_popular: boolean
          requires_consultation: boolean
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: Partial<Database['public']['Tables']['services']['Row']>
        Update: Partial<Database['public']['Tables']['services']['Row']>
      }
      pricing_tiers: {
        Row: {
          id: string
          service_id: string | null
          category: string
          subcategory: string | null
          name: string
          price_dkk: number
          duration_minutes: number | null
          notes: string | null
          display_order: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: Partial<Database['public']['Tables']['pricing_tiers']['Row']>
        Update: Partial<Database['public']['Tables']['pricing_tiers']['Row']>
      }
      team_members: {
        Row: {
          id: string
          name: string
          role: string
          short_bio: string | null
          long_bio: string | null
          photo_url: string | null
          qualifications: Json
          display_order: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: Partial<Database['public']['Tables']['team_members']['Row']>
        Update: Partial<Database['public']['Tables']['team_members']['Row']>
      }
      consultation_leads: {
        Row: {
          id: string
          name: string
          phone: string
          note: string | null
          areas: Json
          recommendations: Json
          handled: boolean
          created_at: string
        }
        Insert: Partial<Database['public']['Tables']['consultation_leads']['Row']>
        Update: Partial<Database['public']['Tables']['consultation_leads']['Row']>
      }
      opening_hours: {
        Row: {
          day_of_week: number
          is_closed: boolean
          open_time: string | null
          close_time: string | null
          notes: string | null
          updated_at: string
        }
        Insert: Partial<Database['public']['Tables']['opening_hours']['Row']>
        Update: Partial<Database['public']['Tables']['opening_hours']['Row']>
      }
      packages_offers: {
        Row: {
          id: string
          name: string
          description: string | null
          original_price_dkk: number | null
          package_price_dkk: number
          hero_image_url: string | null
          starts_at: string | null
          ends_at: string | null
          cta_text: string
          planway_link: string | null
          display_order: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: Partial<Database['public']['Tables']['packages_offers']['Row']>
        Update: Partial<Database['public']['Tables']['packages_offers']['Row']>
      }
      site_settings: {
        Row: {
          key: string
          value: string | null
          updated_at: string
        }
        Insert: Partial<Database['public']['Tables']['site_settings']['Row']>
        Update: Partial<Database['public']['Tables']['site_settings']['Row']>
      }
      tips: {
        Row: {
          id: string
          title: string
          body: string
          hero_image_url: string | null
          display_order: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: Partial<Database['public']['Tables']['tips']['Row']>
        Update: Partial<Database['public']['Tables']['tips']['Row']>
      }
      redirects: {
        Row: {
          id: string
          source_path: string
          destination_path: string
          status_code: number
          is_active: boolean
          created_at: string
        }
        Insert: Partial<Database['public']['Tables']['redirects']['Row']>
        Update: Partial<Database['public']['Tables']['redirects']['Row']>
      }
      audit_log: {
        Row: {
          id: string
          table_name: string
          record_id: string
          action: string
          user_id: string | null
          user_email: string | null
          ip_address: string | null
          user_agent: string | null
          diff: Json | null
          created_at: string
        }
        Insert: Partial<Database['public']['Tables']['audit_log']['Row']>
        Update: Partial<Database['public']['Tables']['audit_log']['Row']>
      }
    }
  }
}
