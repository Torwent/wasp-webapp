export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  profiles: {
    Tables: {
      access: {
        Row: {
          bundles: string[]
          id: string
          scripts: string[]
        }
        Insert: {
          bundles?: string[]
          id: string
          scripts?: string[]
        }
        Update: {
          bundles?: string[]
          id?: string
          scripts?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "access_id_fkey"
            columns: ["id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      private: {
        Row: {
          email: string
          id: string
          warning: boolean
        }
        Insert: {
          email?: string
          id: string
          warning?: boolean
        }
        Update: {
          email?: string
          id?: string
          warning?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "private_id_fkey"
            columns: ["id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      profiles: {
        Row: {
          avatar: string
          customer_id: string | null
          discord: string
          email: string
          id: string
          username: string
        }
        Insert: {
          avatar?: string
          customer_id?: string | null
          discord?: string
          email?: string
          id: string
          username?: string
        }
        Update: {
          avatar?: string
          customer_id?: string | null
          discord?: string
          email?: string
          id?: string
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      roles: {
        Row: {
          administrator: boolean
          banned: boolean
          created_at: string
          developer: boolean
          id: string
          moderator: boolean
          premium: boolean
          scripter: boolean
          tester: boolean
          timeout: boolean
          vip: boolean
        }
        Insert: {
          administrator?: boolean
          banned?: boolean
          created_at?: string
          developer?: boolean
          id: string
          moderator?: boolean
          premium?: boolean
          scripter?: boolean
          tester?: boolean
          timeout?: boolean
          vip?: boolean
        }
        Update: {
          administrator?: boolean
          banned?: boolean
          created_at?: string
          developer?: boolean
          id?: string
          moderator?: boolean
          premium?: boolean
          scripter?: boolean
          tester?: boolean
          timeout?: boolean
          vip?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "roles_id_fkey"
            columns: ["id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      scripters: {
        Row: {
          content: string | null
          description: string | null
          fts: unknown
          github: string | null
          id: string
          paypal_id: string | null
          realname: string | null
          search: string
          url: string
        }
        Insert: {
          content?: string | null
          description?: string | null
          fts: unknown
          github?: string | null
          id: string
          paypal_id?: string | null
          realname?: string | null
          search: string
          url?: string
        }
        Update: {
          content?: string | null
          description?: string | null
          fts?: unknown
          github?: string | null
          id?: string
          paypal_id?: string | null
          realname?: string | null
          search?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "scripters_id_fkey"
            columns: ["id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      subscriptions: {
        Row: {
          cancel: boolean
          customer_id: string | null
          date_end: string
          date_start: string
          external: boolean
          id: string
          price_id: string
          subscription_id: string | null
        }
        Insert: {
          cancel?: boolean
          customer_id?: string | null
          date_end?: string
          date_start?: string
          external?: boolean
          id: string
          price_id?: string
          subscription_id?: string | null
        }
        Update: {
          cancel?: boolean
          customer_id?: string | null
          date_end?: string
          date_start?: string
          external?: boolean
          id?: string
          price_id?: string
          subscription_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_id_fkey"
            columns: ["id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_price_id_fkey"
            columns: ["price_id"]
            referencedRelation: "prices"
            referencedColumns: ["stripe_id"]
          }
        ]
      }
      subscriptions_new: {
        Row: {
          cancel: boolean
          customer_id: string | null
          date_end: string
          date_start: string
          id: string
          price_id: string
          subscription: string | null
        }
        Insert: {
          cancel?: boolean
          customer_id?: string | null
          date_end?: string
          date_start?: string
          id: string
          price_id?: string
          subscription?: string | null
        }
        Update: {
          cancel?: boolean
          customer_id?: string | null
          date_end?: string
          date_start?: string
          id?: string
          price_id?: string
          subscription?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_new_id_fkey"
            columns: ["id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_new_price_id_fkey"
            columns: ["price_id"]
            referencedRelation: "prices"
            referencedColumns: ["stripe_id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      auth_get_avatar: {
        Args: {
          user_id: string
        }
        Returns: string
      }
      auth_get_discord: {
        Args: {
          user_id: string
        }
        Returns: string
      }
      auth_get_username: {
        Args: {
          user_id: string
        }
        Returns: string
      }
      get_access: {
        Args: {
          user_id: string
        }
        Returns: unknown
      }
      get_avatar: {
        Args: {
          user_id: string
        }
        Returns: string
      }
      get_discord: {
        Args: {
          user_id: string
        }
        Returns: string
      }
      get_email: {
        Args: {
          user_id: string
        }
        Returns: string
      }
      get_profile:
        | {
            Args: {
              user_id: string
            }
            Returns: Database["public"]["CompositeTypes"]["profile_data_type"]
          }
        | {
            Args: Record<PropertyKey, never>
            Returns: Database["public"]["CompositeTypes"]["profile_data_type"]
          }
      get_user_id: {
        Args: {
          disc_id: string
        }
        Returns: string
      }
      get_username:
        | {
            Args: Record<PropertyKey, never>
            Returns: string
          }
        | {
            Args: {
              user_id: string
            }
            Returns: string
          }
      has_access:
        | {
            Args: {
              user_id: string
              script_id: string
            }
            Returns: boolean
          }
        | {
            Args: {
              script_id: string
            }
            Returns: boolean
          }
      is_role:
        | {
            Args: {
              role: string
            }
            Returns: boolean
          }
        | {
            Args: {
              user_id: string
              role: string
            }
            Returns: boolean
          }
      set_roles: {
        Args: {
          discord_id: string
          param_developer: boolean
          param_premium: boolean
          param_vip: boolean
          param_tester: boolean
          param_mod: boolean
        }
        Returns: undefined
      }
      set_user_roles: {
        Args: {
          user_id: string
          param_developer: boolean
          param_premium: boolean
          param_vip: boolean
          param_tester: boolean
          param_scripter: boolean
          param_moderator: boolean
          param_administrator: boolean
        }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      faq_errors: {
        Row: {
          content: string
          created_at: string
          id: number
          title: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: number
          title: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: number
          title?: string
        }
        Relationships: []
      }
      faq_questions: {
        Row: {
          content: string
          created_at: string
          id: number
          title: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: number
          title: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: number
          title?: string
        }
        Relationships: []
      }
      prices: {
        Row: {
          amount: number
          created_at: string | null
          currency: string
          id: string
          interval: string | null
          recurring: boolean
          stripe_id: string
          stripe_product: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string
          id?: string
          interval?: string | null
          recurring?: boolean
          stripe_id?: string
          stripe_product?: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string
          id?: string
          interval?: string | null
          recurring?: boolean
          stripe_id?: string
          stripe_product?: string
        }
        Relationships: []
      }
      stats: {
        Row: {
          experience: number | null
          gold: number | null
          id: string
          levels: number
          password: string
          runtime: number | null
          updated_at: string | null
          username: string
        }
        Insert: {
          experience?: number | null
          gold?: number | null
          id: string
          levels?: number
          password?: string
          runtime?: number | null
          updated_at?: string | null
          username?: string
        }
        Update: {
          experience?: number | null
          gold?: number | null
          id?: string
          levels?: number
          password?: string
          runtime?: number | null
          updated_at?: string | null
          username?: string
        }
        Relationships: []
      }
      tutorials: {
        Row: {
          author_id: string
          content: string
          created_at: string
          description: string
          fts: unknown
          id: string
          level: number
          order: number
          published: boolean
          search: string
          title: string
          url: string
          username: string
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string
          description: string
          fts?: unknown
          id?: string
          level?: number
          order?: number
          published?: boolean
          search: string
          title: string
          url: string
          username?: string
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string
          description?: string
          fts?: unknown
          id?: string
          level?: number
          order?: number
          published?: boolean
          search?: string
          title?: string
          url?: string
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "tutorials_author_id_fkey"
            columns: ["author_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      _array_remove: {
        Args: {
          arr: unknown
          values_to_remove: unknown
        }
        Returns: unknown
      }
      _array_reverse: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      _strip_html: {
        Args: {
          input_text: string
        }
        Returns: string
      }
      array_unique: {
        Args: {
          a: string[]
        }
        Returns: unknown
      }
      delete_user: {
        Args: {
          user_to_delete: string
        }
        Returns: undefined
      }
      encode_seo: {
        Args: {
          url: string
        }
        Returns: string
      }
      generate_search_vector: {
        Args: {
          id: string
          data: string[]
        }
        Returns: unknown
      }
      get_common_words:
        | {
            Args: {
              text_array: string[]
            }
            Returns: unknown
          }
        | {
            Args: {
              text_array: string[]
              limit_val: number
            }
            Returns: unknown
          }
      get_stats_total: {
        Args: Record<PropertyKey, never>
        Returns: {
          experience: number
          gold: number
          levels: number
          runtime: number
        }[]
      }
      is_dashboard: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_owner: {
        Args: {
          id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      profile_data_type: {
        id: string
        username: string
        avatar_url: string
        updated_at: string
        discord_id: string
        developer: boolean
        premium: boolean
        vip: boolean
        tester: boolean
        moderator: boolean
        administrator: boolean
        unlocked_ips: number
        scripter: boolean
        timeout: boolean
        subscription_external: boolean
        subscription_start: string
        subscription_end: string
        subscription_id: string
        cancel_at_period_end: boolean
        customer_id: string
        price_id: string
        dismissed_warning: boolean
        email: string
      }
    }
  }
  scripts: {
    Tables: {
      bundles: {
        Row: {
          id: string
          name: string
          quantity: number | null
          scripts: string[]
        }
        Insert: {
          id?: string
          name?: string
          quantity?: number | null
          scripts: string[]
        }
        Update: {
          id?: string
          name?: string
          quantity?: number | null
          scripts?: string[]
        }
        Relationships: []
      }
      categories: {
        Row: {
          emoji: string
          name: string
        }
        Insert: {
          emoji: string
          name: string
        }
        Update: {
          emoji?: string
          name?: string
        }
        Relationships: []
      }
      protected: {
        Row: {
          assets: string
          author_id: string
          avatar: string
          broken: boolean
          id: string
          revision: number
          revision_date: string
          username: string | null
        }
        Insert: {
          assets?: string
          author_id: string
          avatar?: string
          broken?: boolean
          id: string
          revision?: number
          revision_date?: string
          username?: string | null
        }
        Update: {
          assets?: string
          author_id?: string
          avatar?: string
          broken?: boolean
          id?: string
          revision?: number
          revision_date?: string
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "protected_author_id_fkey"
            columns: ["author_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "protected_id_fkey"
            columns: ["id"]
            referencedRelation: "scripts"
            referencedColumns: ["id"]
          }
        ]
      }
      scripts: {
        Row: {
          categories: string[]
          content: string
          created_at: string
          description: string
          fts: unknown
          id: string
          max_gp: number
          max_xp: number
          min_gp: number
          min_xp: number
          published: boolean
          search: string
          subcategories: string[]
          title: string
          tooltip_emojis: string[]
          tooltip_names: string[]
          url: string | null
        }
        Insert: {
          categories?: string[]
          content: string
          created_at?: string
          description: string
          fts: unknown
          id?: string
          max_gp?: number
          max_xp?: number
          min_gp?: number
          min_xp?: number
          published?: boolean
          search?: string
          subcategories?: string[]
          title: string
          tooltip_emojis?: string[]
          tooltip_names?: string[]
          url?: string | null
        }
        Update: {
          categories?: string[]
          content?: string
          created_at?: string
          description?: string
          fts?: unknown
          id?: string
          max_gp?: number
          max_xp?: number
          min_gp?: number
          min_xp?: number
          published?: boolean
          search?: string
          subcategories?: string[]
          title?: string
          tooltip_emojis?: string[]
          tooltip_names?: string[]
          url?: string | null
        }
        Relationships: []
      }
      stats_simba: {
        Row: {
          experience: number
          gold: number
          id: string
          levels: number
          online_users: Json[]
          online_users_total: number
          runtime: number
          unique_users: string[]
          unique_users_total: number
        }
        Insert: {
          experience?: number
          gold?: number
          id?: string
          levels?: number
          online_users?: Json[]
          online_users_total?: number
          runtime?: number
          unique_users?: string[]
          unique_users_total?: number
        }
        Update: {
          experience?: number
          gold?: number
          id?: string
          levels?: number
          online_users?: Json[]
          online_users_total?: number
          runtime?: number
          unique_users?: string[]
          unique_users_total?: number
        }
        Relationships: [
          {
            foreignKeyName: "stats_simba_id_fkey"
            columns: ["id"]
            referencedRelation: "scripts"
            referencedColumns: ["id"]
          }
        ]
      }
      stats_site: {
        Row: {
          id: string
          month_anchor: string
          month_downloads: string[]
          month_downloads_total: number
          month_reports: string[]
          month_reports_total: number
          previous_months: Json[]
          unique_downloads: string[]
          unique_downloads_total: number
        }
        Insert: {
          id: string
          month_anchor?: string
          month_downloads?: string[]
          month_downloads_total?: number
          month_reports?: string[]
          month_reports_total?: number
          previous_months?: Json[]
          unique_downloads?: string[]
          unique_downloads_total?: number
        }
        Update: {
          id?: string
          month_anchor?: string
          month_downloads?: string[]
          month_downloads_total?: number
          month_reports?: string[]
          month_reports_total?: number
          previous_months?: Json[]
          unique_downloads?: string[]
          unique_downloads_total?: number
        }
        Relationships: [
          {
            foreignKeyName: "stats_site_id_fkey"
            columns: ["id"]
            referencedRelation: "scripts"
            referencedColumns: ["id"]
          }
        ]
      }
      subcategories: {
        Row: {
          category: string
          emoji: string
          name: string
        }
        Insert: {
          category: string
          emoji: string
          name: string
        }
        Update: {
          category?: string
          emoji?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "subcategories_category_fkey"
            columns: ["category"]
            referencedRelation: "categories"
            referencedColumns: ["name"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_botter: {
        Args: {
          script_id: string
          user_id: string
        }
        Returns: undefined
      }
      add_downloader: {
        Args: {
          script_id: string
          user_id: string
        }
        Returns: undefined
      }
      add_reporter: {
        Args: {
          script_id: string
          user_id: string
        }
        Returns: undefined
      }
      bundle_contains: {
        Args: {
          bundle: string
          script: string
        }
        Returns: boolean
      }
      fix_categories:
        | {
            Args: {
              categories: string[]
            }
            Returns: unknown
          }
        | {
            Args: {
              user_id: string
              categories: string[]
            }
            Returns: unknown
          }
      get_assets: {
        Args: {
          script_id: string
        }
        Returns: string
      }
      get_bundle_scripts: {
        Args: {
          ids: string[]
        }
        Returns: unknown
      }
      get_month_downloads_total: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      get_month_premium_downloads_total: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      get_revision: {
        Args: {
          script_id: string
        }
        Returns: number
      }
      get_script_owner: {
        Args: {
          script_id: string
        }
        Returns: string
      }
      get_site_stats: {
        Args: {
          user_id: string
        }
        Returns: {
          total_scripts: number
          total_user_scripts: number
          user_scripts: string[]
          total_premium_scripts: number
          total_user_premium_scripts: number
          month_downloads: number
          month_user_downloads: number
          month_premium_downloads: number
          month_premium_user_downloads: number
        }[]
      }
      get_tooltip_emojis: {
        Args: {
          categories: string[]
          subcategories: string[]
        }
        Returns: unknown
      }
      get_tooltip_names: {
        Args: {
          categories: string[]
          subcategories: string[]
        }
        Returns: unknown
      }
      get_user_scripts: {
        Args: {
          user_id: string
        }
        Returns: {
          id: string
        }[]
      }
      get_virtual_level: {
        Args: {
          experience: number
        }
        Returns: number
      }
      is_author:
        | {
            Args: {
              script_id: string
              user_id: string
            }
            Returns: boolean
          }
        | {
            Args: {
              script_id: string
            }
            Returns: boolean
          }
      is_premium_script: {
        Args: {
          script_id: string
        }
        Returns: boolean
      }
      script_exists: {
        Args: {
          script_id: string
        }
        Returns: boolean
      }
      storage_can_download: {
        Args: {
          file_path: string
        }
        Returns: boolean
      }
      storage_can_edit: {
        Args: {
          file_path: string
        }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  storage: {
    Tables: {
      buckets: {
        Row: {
          allowed_mime_types: string[] | null
          avif_autodetection: boolean | null
          created_at: string | null
          file_size_limit: number | null
          id: string
          name: string
          owner: string | null
          public: boolean | null
          updated_at: string | null
        }
        Insert: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id: string
          name: string
          owner?: string | null
          public?: boolean | null
          updated_at?: string | null
        }
        Update: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id?: string
          name?: string
          owner?: string | null
          public?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "buckets_owner_fkey"
            columns: ["owner"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      migrations: {
        Row: {
          executed_at: string | null
          hash: string
          id: number
          name: string
        }
        Insert: {
          executed_at?: string | null
          hash: string
          id: number
          name: string
        }
        Update: {
          executed_at?: string | null
          hash?: string
          id?: number
          name?: string
        }
        Relationships: []
      }
      objects: {
        Row: {
          bucket_id: string | null
          created_at: string | null
          id: string
          last_accessed_at: string | null
          metadata: Json | null
          name: string | null
          owner: string | null
          path_tokens: string[] | null
          updated_at: string | null
          version: string | null
        }
        Insert: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          version?: string | null
        }
        Update: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "objects_bucketId_fkey"
            columns: ["bucket_id"]
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "objects_owner_fkey"
            columns: ["owner"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_insert_object: {
        Args: {
          bucketid: string
          name: string
          owner: string
          metadata: Json
        }
        Returns: undefined
      }
      extension: {
        Args: {
          name: string
        }
        Returns: string
      }
      filename: {
        Args: {
          name: string
        }
        Returns: string
      }
      foldername: {
        Args: {
          name: string
        }
        Returns: unknown
      }
      get_size_by_bucket: {
        Args: Record<PropertyKey, never>
        Returns: {
          size: number
          bucket_id: string
        }[]
      }
      search: {
        Args: {
          prefix: string
          bucketname: string
          limits?: number
          levels?: number
          offsets?: number
          search?: string
          sortcolumn?: string
          sortorder?: string
        }
        Returns: {
          name: string
          id: string
          updated_at: string
          created_at: string
          last_accessed_at: string
          metadata: Json
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
