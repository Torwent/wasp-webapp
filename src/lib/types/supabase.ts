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
  public: {
    Tables: {
      developers: {
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
          search_developers: string | null
        }
        Insert: {
          content?: string | null
          description?: string | null
          fts?: unknown
          github?: string | null
          id: string
          paypal_id?: string | null
          realname?: string | null
          search: string
          url: string
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
            foreignKeyName: "developers_id_fkey"
            columns: ["id"]
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          }
        ]
      }
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
      ip_whitelist: {
        Row: {
          id: string
          ip: string
          user: string
        }
        Insert: {
          id?: string
          ip: string
          user: string
        }
        Update: {
          id?: string
          ip?: string
          user?: string
        }
        Relationships: [
          {
            foreignKeyName: "ip_whitelist_user_fkey"
            columns: ["user"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      packages: {
        Row: {
          body: Json | null
          created_at: string | null
          id: number
          name: string | null
          pkg_file: string | null
          versions: Json | null
        }
        Insert: {
          body?: Json | null
          created_at?: string | null
          id?: number
          name?: string | null
          pkg_file?: string | null
          versions?: Json | null
        }
        Update: {
          body?: Json | null
          created_at?: string | null
          id?: number
          name?: string | null
          pkg_file?: string | null
          versions?: Json | null
        }
        Relationships: []
      }
      profiles_private: {
        Row: {
          dismissed_warning: boolean
          email: string | null
          id: string
          updated_at: string
        }
        Insert: {
          dismissed_warning?: boolean
          email?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          dismissed_warning?: boolean
          email?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_private_id_fkey"
            columns: ["id"]
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          }
        ]
      }
      profiles_protected: {
        Row: {
          administrator: boolean
          cancel_at_period_end: boolean
          developer: boolean
          id: string
          moderator: boolean
          premium: boolean
          scripter: boolean
          subscription_end: string | null
          subscription_external: boolean
          subscription_id: string | null
          subscription_start: string | null
          tester: boolean
          timeout: boolean
          unlocked_ips: number
          updated_at: string
          vip: boolean
        }
        Insert: {
          administrator?: boolean
          cancel_at_period_end?: boolean
          developer?: boolean
          id: string
          moderator?: boolean
          premium?: boolean
          scripter?: boolean
          subscription_end?: string | null
          subscription_external?: boolean
          subscription_id?: string | null
          subscription_start?: string | null
          tester?: boolean
          timeout?: boolean
          unlocked_ips?: number
          updated_at?: string
          vip?: boolean
        }
        Update: {
          administrator?: boolean
          cancel_at_period_end?: boolean
          developer?: boolean
          id?: string
          moderator?: boolean
          premium?: boolean
          scripter?: boolean
          subscription_end?: string | null
          subscription_external?: boolean
          subscription_id?: string | null
          subscription_start?: string | null
          tester?: boolean
          timeout?: boolean
          unlocked_ips?: number
          updated_at?: string
          vip?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "profiles_protected_id_fkey"
            columns: ["id"]
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          }
        ]
      }
      profiles_public: {
        Row: {
          avatar_url: string
          discord_id: string
          id: string
          updated_at: string
          username: string
        }
        Insert: {
          avatar_url: string
          discord_id: string
          id: string
          updated_at?: string
          username: string
        }
        Update: {
          avatar_url?: string
          discord_id?: string
          id?: string
          updated_at?: string
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_public_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      scripts_categories: {
        Row: {
          emoji: string
          id: number
          name: string
        }
        Insert: {
          emoji: string
          id?: number
          name: string
        }
        Update: {
          emoji?: string
          id?: number
          name?: string
        }
        Relationships: []
      }
      scripts_protected: {
        Row: {
          assets_alt: string
          assets_path: string
          author_id: string
          created_at: string | null
          id: string
          revision: number
        }
        Insert: {
          assets_alt?: string
          assets_path?: string
          author_id: string
          created_at?: string | null
          id: string
          revision?: number
        }
        Update: {
          assets_alt?: string
          assets_path?: string
          author_id?: string
          created_at?: string | null
          id?: string
          revision?: number
        }
        Relationships: [
          {
            foreignKeyName: "scripts_protected_author_id_fkey"
            columns: ["author_id"]
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scripts_protected_id_fkey"
            columns: ["id"]
            referencedRelation: "scripts_public"
            referencedColumns: ["id"]
          }
        ]
      }
      scripts_public: {
        Row: {
          categories: string[]
          content: string
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
          updated_at: string
          url: string
          search_script: string | null
        }
        Insert: {
          categories: string[]
          content: string
          description: string
          fts?: unknown
          id?: string
          max_gp?: number
          max_xp?: number
          min_gp?: number
          min_xp?: number
          published?: boolean
          search: string
          subcategories: string[]
          title: string
          tooltip_emojis: string[]
          tooltip_names: string[]
          updated_at?: string
          url: string
        }
        Update: {
          categories?: string[]
          content?: string
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
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      scripts_subcategories: {
        Row: {
          category: string
          emoji: string
          id: number
          name: string
        }
        Insert: {
          category: string
          emoji: string
          id?: number
          name: string
        }
        Update: {
          category?: string
          emoji?: string
          id?: number
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "scripts_subcategories_category_fkey"
            columns: ["category"]
            referencedRelation: "scripts_categories"
            referencedColumns: ["name"]
          }
        ]
      }
      stats: {
        Row: {
          experience: number | null
          gold: number | null
          levels: number | null
          password: string
          runtime: number | null
          updated_at: string | null
          userID: string
          username: string
        }
        Insert: {
          experience?: number | null
          gold?: number | null
          levels?: number | null
          password?: string
          runtime?: number | null
          updated_at?: string | null
          userID: string
          username?: string
        }
        Update: {
          experience?: number | null
          gold?: number | null
          levels?: number | null
          password?: string
          runtime?: number | null
          updated_at?: string | null
          userID?: string
          username?: string
        }
        Relationships: []
      }
      stats_scripts: {
        Row: {
          current_users: Json[]
          experience: number
          gold: number | null
          levels: number
          monthly_users: Json[]
          runtime: number | null
          script_id: string
          total_current_users: number
          total_monthly_users: number
          total_unique_users: number
          unique_users: string[]
        }
        Insert: {
          current_users?: Json[]
          experience?: number
          gold?: number | null
          levels?: number
          monthly_users?: Json[]
          runtime?: number | null
          script_id: string
          total_current_users?: number
          total_monthly_users?: number
          total_unique_users?: number
          unique_users?: string[]
        }
        Update: {
          current_users?: Json[]
          experience?: number
          gold?: number | null
          levels?: number
          monthly_users?: Json[]
          runtime?: number | null
          script_id?: string
          total_current_users?: number
          total_monthly_users?: number
          total_unique_users?: number
          unique_users?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "stats_scripts_script_id_fkey"
            columns: ["script_id"]
            referencedRelation: "scripts_public"
            referencedColumns: ["id"]
          }
        ]
      }
      tutorials: {
        Row: {
          content: string
          created_at: string
          description: string
          fts: unknown
          id: string
          level: number
          order: number | null
          search: string
          title: string
          url: string
          user_id: string
          search_tutorials: string | null
        }
        Insert: {
          content: string
          created_at?: string
          description: string
          fts?: unknown
          id?: string
          level?: number
          order?: number | null
          search: string
          title: string
          url: string
          user_id?: string
        }
        Update: {
          content?: string
          created_at?: string
          description?: string
          fts?: unknown
          id?: string
          level?: number
          order?: number | null
          search?: string
          title?: string
          url?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tutorials_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles_public"
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
      encode_seo: {
        Args: {
          url: string
        }
        Returns: string
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
      generate_search_vector: {
        Args: {
          id: string
          data: string[]
        }
        Returns: unknown
      }
      get_assets_path: {
        Args: {
          id: string
        }
        Returns: string
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
      get_discord_id: {
        Args: {
          user_id: string
        }
        Returns: string
      }
      get_script_owner: {
        Args: {
          script_id: string
        }
        Returns: string
      }
      get_script_revision: {
        Args: {
          script_id: string
        }
        Returns: number
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
      get_tooltips_emojis: {
        Args: {
          categories_str: string[]
          subcategories_str: string[]
        }
        Returns: unknown
      }
      get_tooltips_names: {
        Args: {
          categories_str: string[]
          subcategories_str: string[]
        }
        Returns: unknown
      }
      get_user_id: {
        Args: {
          disc_id: string
        }
        Returns: string
      }
      get_username:
        | {
            Args: {
              user_id: string
            }
            Returns: string
          }
        | {
            Args: Record<PropertyKey, never>
            Returns: string
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
      is_script_premium: {
        Args: {
          script_id: string
        }
        Returns: boolean
      }
      profile_protected_exists: {
        Args: {
          id: string
        }
        Returns: boolean
      }
      profile_public_exists: {
        Args: {
          user_id: string
          disc_id: string
        }
        Returns: boolean
      }
      script_exists: {
        Args: {
          script_id: string
        }
        Returns: boolean
      }
      search_developers: {
        Args: {
          "": unknown
        }
        Returns: string
      }
      search_script: {
        Args: {
          "": unknown
        }
        Returns: string
      }
      search_tutorials: {
        Args: {
          "": unknown
        }
        Returns: string
      }
      set_discord_roles: {
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
