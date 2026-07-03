export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
	_supavisor: {
		Tables: {
			[_ in never]: never
		}
		Views: {
			[_ in never]: never
		}
		Functions: {
			[_ in never]: never
		}
		Enums: {
			[_ in never]: never
		}
		CompositeTypes: {
			[_ in never]: never
		}
	}
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
					extensions?: Json
					operationName?: string
					query?: string
					variables?: Json
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
	info: {
		Tables: {
			discord: {
				Row: {
					created_at: string
					id: string
					response: string
				}
				Insert: {
					created_at?: string
					id?: string
					response: string
				}
				Update: {
					created_at?: string
					id?: string
					response?: string
				}
				Relationships: []
			}
			errors: {
				Row: {
					content: string
					created_at: string | null
					id: number
					title: string
				}
				Insert: {
					content: string
					created_at?: string | null
					id?: number
					title: string
				}
				Update: {
					content?: string
					created_at?: string | null
					id?: number
					title?: string
				}
				Relationships: []
			}
			privacy_policy: {
				Row: {
					content: string
					created_at: string
					id: string
					version: number
				}
				Insert: {
					content: string
					created_at?: string
					id?: string
					version?: number
				}
				Update: {
					content?: string
					created_at?: string
					id?: string
					version?: number
				}
				Relationships: []
			}
			questions: {
				Row: {
					content: string
					created_at: string | null
					id: number
					title: string
				}
				Insert: {
					content: string
					created_at?: string | null
					id?: number
					title: string
				}
				Update: {
					content?: string
					created_at?: string | null
					id?: number
					title?: string
				}
				Relationships: []
			}
			scripter_tos: {
				Row: {
					content: string
					created_at: string
					id: string
					version: number
				}
				Insert: {
					content: string
					created_at?: string
					id?: string
					version?: number
				}
				Update: {
					content?: string
					created_at?: string
					id?: string
					version?: number
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
					search: string | null
					title: string
					url: string
					username: string
				}
				Insert: {
					author_id?: string
					content: string
					created_at?: string
					description: string
					fts?: unknown
					id?: string
					level?: number
					order: number
					published?: boolean
					search?: string | null
					title: string
					url?: string
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
					search?: string | null
					title?: string
					url?: string
					username?: string
				}
				Relationships: []
			}
			user_tos: {
				Row: {
					content: string
					created_at: string
					id: string
					version: number
				}
				Insert: {
					content: string
					created_at?: string
					id?: string
					version?: number
				}
				Update: {
					content?: string
					created_at?: string
					id?: string
					version?: number
				}
				Relationships: []
			}
		}
		Views: {
			[_ in never]: never
		}
		Functions: {
			is_author:
				| { Args: { tutorial_id: string }; Returns: boolean }
				| { Args: { tutorial_id: string; user_id: string }; Returns: boolean }
		}
		Enums: {
			[_ in never]: never
		}
		CompositeTypes: {
			[_ in never]: never
		}
	}
	pgbouncer: {
		Tables: {
			[_ in never]: never
		}
		Views: {
			[_ in never]: never
		}
		Functions: {
			get_auth: {
				Args: { p_usename: string }
				Returns: {
					password: string
					username: string
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
	profiles: {
		Tables: {
			balances: {
				Row: {
					balance: number
					id: string
					stripe: string
				}
				Insert: {
					balance?: number
					id?: string
					stripe: string
				}
				Update: {
					balance?: number
					id?: string
					stripe?: string
				}
				Relationships: [
					{
						foreignKeyName: "balances_id_fkey"
						columns: ["id"]
						referencedRelation: "random_scripters"
						referencedColumns: ["id"]
					},
					{
						foreignKeyName: "balances_id_fkey"
						columns: ["id"]
						referencedRelation: "scripters"
						referencedColumns: ["id"]
					},
					{
						foreignKeyName: "balances_stripe_fkey"
						columns: ["stripe"]
						referencedRelation: "random_scripters"
						referencedColumns: ["stripe"]
					},
					{
						foreignKeyName: "balances_stripe_fkey"
						columns: ["stripe"]
						referencedRelation: "scripters"
						referencedColumns: ["stripe"]
					}
				]
			}
			free_access: {
				Row: {
					date_end: string
					date_start: string
					id: string
					product: string
					row_id: string
				}
				Insert: {
					date_end?: string
					date_start?: string
					id: string
					product: string
					row_id?: string
				}
				Update: {
					date_end?: string
					date_start?: string
					id?: string
					product?: string
					row_id?: string
				}
				Relationships: [
					{
						foreignKeyName: "free_access_id_fkey"
						columns: ["id"]
						referencedRelation: "profiles"
						referencedColumns: ["id"]
					}
				]
			}
			free_access_old: {
				Row: {
					date_end: string
					date_start: string
					id: string
					product: string
					row_id: string
				}
				Insert: {
					date_end?: string
					date_start?: string
					id: string
					product: string
					row_id?: string
				}
				Update: {
					date_end?: string
					date_start?: string
					id?: string
					product?: string
					row_id?: string
				}
				Relationships: [
					{
						foreignKeyName: "free_access_old_id_fkey"
						columns: ["id"]
						referencedRelation: "profiles"
						referencedColumns: ["id"]
					}
				]
			}
			private: {
				Row: {
					email: string | null
					id: string
					warning: boolean
				}
				Insert: {
					email?: string | null
					id: string
					warning?: boolean
				}
				Update: {
					email?: string | null
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
					id: string
					username: string | null
				}
				Insert: {
					avatar?: string
					customer_id?: string | null
					discord?: string
					id: string
					username?: string | null
				}
				Update: {
					avatar?: string
					customer_id?: string | null
					discord?: string
					id?: string
					username?: string | null
				}
				Relationships: []
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
					stripe: string | null
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
					stripe?: string | null
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
					stripe?: string | null
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
			subscription: {
				Row: {
					cancel: boolean
					date_end: string
					date_start: string
					disabled: boolean
					id: string
					price: string
					product: string
					subscription: string
				}
				Insert: {
					cancel?: boolean
					date_end?: string
					date_start?: string
					disabled?: boolean
					id: string
					price: string
					product: string
					subscription: string
				}
				Update: {
					cancel?: boolean
					date_end?: string
					date_start?: string
					disabled?: boolean
					id?: string
					price?: string
					product?: string
					subscription?: string
				}
				Relationships: [
					{
						foreignKeyName: "subscription_id_fkey"
						columns: ["id"]
						referencedRelation: "profiles"
						referencedColumns: ["id"]
					}
				]
			}
			subscriptions_old: {
				Row: {
					cancel: boolean
					date_end: string
					date_start: string
					disabled: boolean
					id: string
					price: string
					product: string
					subscription: string
				}
				Insert: {
					cancel?: boolean
					date_end?: string
					date_start?: string
					disabled?: boolean
					id: string
					price: string
					product: string
					subscription: string
				}
				Update: {
					cancel?: boolean
					date_end?: string
					date_start?: string
					disabled?: boolean
					id?: string
					price?: string
					product?: string
					subscription?: string
				}
				Relationships: [
					{
						foreignKeyName: "subscriptions_old_id_fkey"
						columns: ["id"]
						referencedRelation: "profiles"
						referencedColumns: ["id"]
					}
				]
			}
			subscriptions_uc: {
				Row: {
					cancel: boolean
					date_end: string
					date_start: string
					external: boolean
					id: string
					price_id: string
					subscription_id: string | null
				}
				Insert: {
					cancel?: boolean
					date_end?: string
					date_start?: string
					external?: boolean
					id: string
					price_id?: string
					subscription_id?: string | null
				}
				Update: {
					cancel?: boolean
					date_end?: string
					date_start?: string
					external?: boolean
					id?: string
					price_id?: string
					subscription_id?: string | null
				}
				Relationships: []
			}
		}
		Views: {
			random_scripters: {
				Row: {
					content: string | null
					description: string | null
					fts: unknown
					github: string | null
					id: string | null
					paypal_id: string | null
					realname: string | null
					search: string | null
					stripe: string | null
					url: string | null
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
		}
		Functions: {
			auth_get_avatar: { Args: { user_id: string }; Returns: string }
			auth_get_discord: { Args: { user_id: string }; Returns: string }
			auth_get_username: { Args: { user_id: string }; Returns: string }
			can_access:
				| { Args: { accesser_id: string; script_id: string }; Returns: boolean }
				| { Args: { script_id: string }; Returns: boolean }
			can_view_subscription: {
				Args: { accesser: string; product: string }
				Returns: boolean
			}
			create_stripe_customer: {
				Args: {
					discord_id: string
					email: string
					id: string
					username: string
				}
				Returns: number
			}
			cron_check_subscriptions: { Args: never; Returns: undefined }
			get_avatar: { Args: { user_id: string }; Returns: string }
			get_discord: { Args: { user_id: string }; Returns: string }
			get_email: { Args: { user_id: string }; Returns: string }
			get_profile:
				| {
						Args: never
						Returns: Database["public"]["CompositeTypes"]["profile_data_type"]
						SetofOptions: {
							from: "*"
							to: "profile_data_type"
							isOneToOne: true
							isSetofReturn: false
						}
				  }
				| {
						Args: { user_id: string }
						Returns: Database["public"]["CompositeTypes"]["profile_data_type"]
						SetofOptions: {
							from: "*"
							to: "profile_data_type"
							isOneToOne: true
							isSetofReturn: false
						}
				  }
			get_stripe_user: { Args: { user_id: string }; Returns: string }
			get_subscriptions: {
				Args: { p_amount: number; p_page: number; p_user_id: string }
				Returns: {
					cancel: boolean
					date_end: string
					date_start: string
					id: string
					product: string
					total_count: number
				}[]
			}
			get_user_id: { Args: { disc_id: string }; Returns: string }
			get_username:
				| { Args: never; Returns: string }
				| { Args: { user_id: string }; Returns: string }
			is_role:
				| { Args: { role: string }; Returns: boolean }
				| { Args: { role: string; user_id: string }; Returns: boolean }
			set_roles: {
				Args: {
					discord_id: string
					param_developer: boolean
					param_mod: boolean
					param_premium: boolean
					param_tester: boolean
					param_vip: boolean
				}
				Returns: undefined
			}
			set_user_roles: {
				Args: {
					param_administrator: boolean
					param_developer: boolean
					param_moderator: boolean
					param_premium: boolean
					param_scripter: boolean
					param_tester: boolean
					param_vip: boolean
					user_id: string
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
			stats: {
				Row: {
					experience: number
					gold: number
					id: string
					levels: number
					password: string
					runtime: number
					updated_at: string | null
					username: string
				}
				Insert: {
					experience?: number
					gold?: number
					id: string
					levels?: number
					password?: string
					runtime?: number
					updated_at?: string | null
					username?: string
				}
				Update: {
					experience?: number
					gold?: number
					id?: string
					levels?: number
					password?: string
					runtime?: number
					updated_at?: string | null
					username?: string
				}
				Relationships: []
			}
			stats_bak: {
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
		}
		Views: {
			mv_stats_total: {
				Row: {
					experience: number | null
					gold: number | null
					levels: number | null
					runtime: number | null
				}
				Relationships: []
			}
		}
		Functions: {
			_array_remove: {
				Args: { arr: unknown; values_to_remove: unknown }
				Returns: unknown
			}
			_strip_html: { Args: { input_text: string }; Returns: string }
			array_unique: { Args: { a: string[] }; Returns: string[] }
			delete_user: { Args: { user_to_delete: string }; Returns: undefined }
			encode_seo: { Args: { url: string }; Returns: string }
			generate_search_vector: {
				Args: { data: string[]; id: string }
				Returns: unknown
			}
			get_common_words:
				| { Args: { text_array: string[] }; Returns: string[] }
				| {
						Args: { limit_val: number; text_array: string[] }
						Returns: string[]
				  }
			get_stats_total: {
				Args: never
				Returns: {
					experience: number
					gold: number
					levels: number
					runtime: number
				}[]
			}
			insert_ten_year_sub:
				| { Args: { start: number; user_ids: string[] }; Returns: undefined }
				| { Args: { start: number; user_ids: string[] }; Returns: undefined }
			is_dashboard: { Args: never; Returns: boolean }
			is_owner: { Args: { id: string }; Returns: boolean }
			normalize_nfkc: { Args: { input: string }; Returns: string }
		}
		Enums: {
			script_category:
				| "combat"
				| "boss"
				| "minigame"
				| "moneymaker"
				| "tool"
				| "magic"
				| "prayer"
				| "mining"
				| "fishing"
				| "woodcutting"
				| "hunter"
				| "farming"
				| "cooking"
				| "smithing"
				| "fletching"
				| "firemaking"
				| "herblore"
				| "crafting"
				| "construction"
				| "agility"
				| "slayer"
				| "thieving"
				| "runecrafting"
			script_status: "official" | "community"
			script_type: "premium" | "free"
		}
		CompositeTypes: {
			profile_data_type: {
				id: string | null
				username: string | null
				avatar_url: string | null
				updated_at: string | null
				discord_id: string | null
				developer: boolean | null
				premium: boolean | null
				vip: boolean | null
				tester: boolean | null
				moderator: boolean | null
				administrator: boolean | null
				unlocked_ips: number | null
				scripter: boolean | null
				timeout: boolean | null
				subscription_external: boolean | null
				subscription_start: string | null
				subscription_end: string | null
				subscription_id: string | null
				cancel_at_period_end: boolean | null
				customer_id: string | null
				price_id: string | null
				dismissed_warning: boolean | null
				email: string | null
			}
		}
	}
	scripts: {
		Tables: {
			bundles: {
				Row: {
					id: string
					name: string
					product: string | null
					quantity: number | null
					scripts: string[]
					user_id: string
					username: string | null
				}
				Insert: {
					id?: string
					name?: string
					product?: string | null
					quantity?: number | null
					scripts: string[]
					user_id: string
					username?: string | null
				}
				Update: {
					id?: string
					name?: string
					product?: string | null
					quantity?: number | null
					scripts?: string[]
					user_id?: string
					username?: string | null
				}
				Relationships: [
					{
						foreignKeyName: "bundles_product_fkey"
						columns: ["product"]
						referencedRelation: "products"
						referencedColumns: ["id"]
					}
				]
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
			featured: {
				Row: {
					id: string
					name: string
				}
				Insert: {
					id?: string
					name: string
				}
				Update: {
					id?: string
					name?: string
				}
				Relationships: [
					{
						foreignKeyName: "featured_id_fkey"
						columns: ["id"]
						referencedRelation: "scripts"
						referencedColumns: ["id"]
					}
				]
			}
			metadata: {
				Row: {
					categories: Database["public"]["Enums"]["script_category"][]
					created_at: string
					id: string
					status: Database["public"]["Enums"]["script_status"]
					type: Database["public"]["Enums"]["script_type"]
					updated_at: string
				}
				Insert: {
					categories: Database["public"]["Enums"]["script_category"][]
					created_at?: string
					id?: string
					status?: Database["public"]["Enums"]["script_status"]
					type?: Database["public"]["Enums"]["script_type"]
					updated_at?: string
				}
				Update: {
					categories?: Database["public"]["Enums"]["script_category"][]
					created_at?: string
					id?: string
					status?: Database["public"]["Enums"]["script_status"]
					type?: Database["public"]["Enums"]["script_type"]
					updated_at?: string
				}
				Relationships: [
					{
						foreignKeyName: "metadata_id_fkey"
						columns: ["id"]
						referencedRelation: "scripts"
						referencedColumns: ["id"]
					}
				]
			}
			prices: {
				Row: {
					active: boolean
					amount: number
					currency: string
					id: string
					interval: string
					product: string
				}
				Insert: {
					active?: boolean
					amount: number
					currency?: string
					id: string
					interval: string
					product: string
				}
				Update: {
					active?: boolean
					amount?: number
					currency?: string
					id?: string
					interval?: string
					product?: string
				}
				Relationships: [
					{
						foreignKeyName: "prices_product_fkey"
						columns: ["product"]
						referencedRelation: "products"
						referencedColumns: ["id"]
					}
				]
			}
			products: {
				Row: {
					active: boolean
					bundle: string | null
					id: string
					name: string
					script: string | null
					stripe_user: string | null
					user_id: string
				}
				Insert: {
					active?: boolean
					bundle?: string | null
					id: string
					name: string
					script?: string | null
					stripe_user?: string | null
					user_id: string
				}
				Update: {
					active?: boolean
					bundle?: string | null
					id?: string
					name?: string
					script?: string | null
					stripe_user?: string | null
					user_id?: string
				}
				Relationships: [
					{
						foreignKeyName: "products_bundle_fkey"
						columns: ["bundle"]
						referencedRelation: "bundles"
						referencedColumns: ["id"]
					},
					{
						foreignKeyName: "products_script_fkey"
						columns: ["script"]
						referencedRelation: "scripts"
						referencedColumns: ["id"]
					}
				]
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
					username: string
				}
				Insert: {
					assets?: string
					author_id: string
					avatar?: string
					broken?: boolean
					id: string
					revision?: number
					revision_date?: string
					username?: string
				}
				Update: {
					assets?: string
					author_id?: string
					avatar?: string
					broken?: boolean
					id?: string
					revision?: number
					revision_date?: string
					username?: string
				}
				Relationships: [
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
					categories: string[] | null
					content: string
					created_at: string
					description: string
					fts: unknown
					id: string
					max_gp: number | null
					max_xp: number | null
					min_gp: number | null
					min_xp: number | null
					product: string | null
					published: boolean
					search: string | null
					subcategories: string[] | null
					title: string
					tooltip_emojis: string[] | null
					tooltip_names: string[] | null
					url: string | null
				}
				Insert: {
					categories?: string[] | null
					content: string
					created_at?: string
					description: string
					fts?: unknown
					id?: string
					max_gp?: number | null
					max_xp?: number | null
					min_gp?: number | null
					min_xp?: number | null
					product?: string | null
					published?: boolean
					search?: string | null
					subcategories?: string[] | null
					title: string
					tooltip_emojis?: string[] | null
					tooltip_names?: string[] | null
					url?: string | null
				}
				Update: {
					categories?: string[] | null
					content?: string
					created_at?: string
					description?: string
					fts?: unknown
					id?: string
					max_gp?: number | null
					max_xp?: number | null
					min_gp?: number | null
					min_xp?: number | null
					product?: string | null
					published?: boolean
					search?: string | null
					subcategories?: string[] | null
					title?: string
					tooltip_emojis?: string[] | null
					tooltip_names?: string[] | null
					url?: string | null
				}
				Relationships: [
					{
						foreignKeyName: "scripts_product_fkey"
						columns: ["product"]
						referencedRelation: "products"
						referencedColumns: ["id"]
					}
				]
			}
			stats_limits: {
				Row: {
					gp_max: number
					gp_min: number
					id: string
					xp_max: number
					xp_min: number
				}
				Insert: {
					gp_max?: number
					gp_min?: number
					id: string
					xp_max?: number
					xp_min?: number
				}
				Update: {
					gp_max?: number
					gp_min?: number
					id?: string
					xp_max?: number
					xp_min?: number
				}
				Relationships: [
					{
						foreignKeyName: "stats_limits_id_fkey"
						columns: ["id"]
						referencedRelation: "scripts"
						referencedColumns: ["id"]
					}
				]
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
					id: string
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
					notified: boolean
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
					notified?: boolean
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
					notified?: boolean
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
			author_scripts: {
				Row: {
					author_id: string | null
					premium: number | null
					scripts: string[] | null
				}
				Relationships: []
			}
			featured_mv: {
				Row: {
					id: string | null
					title: string | null
				}
				Relationships: []
			}
		}
		Functions: {
			add_botter: {
				Args: { script_id: string; user_id: string }
				Returns: undefined
			}
			add_downloader: {
				Args: { script_id: string; user_id: string }
				Returns: undefined
			}
			add_reporter: {
				Args: { script_id: string; user_id: string }
				Returns: undefined
			}
			bundle_contains: {
				Args: { bundle: string; script: string }
				Returns: boolean
			}
			cron_refresh_featured: { Args: never; Returns: undefined }
			fix_categories:
				| { Args: { categories: string[] }; Returns: string[] }
				| { Args: { categories: string[]; user_id: string }; Returns: string[] }
			get_assets: { Args: { script_id: string }; Returns: string }
			get_bundle_scripts: { Args: { ids: string[] }; Returns: string[] }
			get_month_downloads_total: { Args: never; Returns: number }
			get_month_premium_downloads_total: { Args: never; Returns: number }
			get_revision: { Args: { script_id: string }; Returns: number }
			get_script_owner: { Args: { script_id: string }; Returns: string }
			get_site_stats: {
				Args: { user_id: string }
				Returns: {
					month_downloads: number
					month_premium_downloads: number
					month_premium_user_downloads: number
					month_user_downloads: number
					total_premium_scripts: number
					total_scripts: number
					total_user_premium_scripts: number
					total_user_scripts: number
					user_scripts: string[]
				}[]
			}
			get_tooltip_emojis: {
				Args: { categories: string[]; subcategories: string[] }
				Returns: string[]
			}
			get_tooltip_names: {
				Args: { categories: string[]; subcategories: string[] }
				Returns: string[]
			}
			get_user_scripts: {
				Args: { user_id: string }
				Returns: {
					id: string
				}[]
			}
			get_virtual_level: { Args: { experience: number }; Returns: number }
			is_author:
				| { Args: { script_id: string }; Returns: boolean }
				| { Args: { script_id: string; user_id: string }; Returns: boolean }
			is_premium_script: { Args: { script_id: string }; Returns: boolean }
			script_exists: { Args: { script_id: string }; Returns: boolean }
			stats_site_monthly_reset: { Args: never; Returns: undefined }
			storage_can_download: { Args: { file_path: string }; Returns: boolean }
			storage_can_edit: { Args: { file_path: string }; Returns: boolean }
			storage_img_can_edit: { Args: { file_path: string }; Returns: boolean }
		}
		Enums: {
			status: "Official" | "Community"
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
					owner_id: string | null
					public: boolean | null
					type: Database["storage"]["Enums"]["buckettype"]
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
					owner_id?: string | null
					public?: boolean | null
					type?: Database["storage"]["Enums"]["buckettype"]
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
					owner_id?: string | null
					public?: boolean | null
					type?: Database["storage"]["Enums"]["buckettype"]
					updated_at?: string | null
				}
				Relationships: []
			}
			buckets_analytics: {
				Row: {
					created_at: string
					deleted_at: string | null
					format: string
					id: string
					name: string
					type: Database["storage"]["Enums"]["buckettype"]
					updated_at: string
				}
				Insert: {
					created_at?: string
					deleted_at?: string | null
					format?: string
					id?: string
					name: string
					type?: Database["storage"]["Enums"]["buckettype"]
					updated_at?: string
				}
				Update: {
					created_at?: string
					deleted_at?: string | null
					format?: string
					id?: string
					name?: string
					type?: Database["storage"]["Enums"]["buckettype"]
					updated_at?: string
				}
				Relationships: []
			}
			buckets_vectors: {
				Row: {
					created_at: string
					id: string
					type: Database["storage"]["Enums"]["buckettype"]
					updated_at: string
				}
				Insert: {
					created_at?: string
					id: string
					type?: Database["storage"]["Enums"]["buckettype"]
					updated_at?: string
				}
				Update: {
					created_at?: string
					id?: string
					type?: Database["storage"]["Enums"]["buckettype"]
					updated_at?: string
				}
				Relationships: []
			}
			iceberg_namespaces: {
				Row: {
					bucket_name: string
					catalog_id: string
					created_at: string
					id: string
					metadata: Json
					name: string
					updated_at: string
				}
				Insert: {
					bucket_name: string
					catalog_id: string
					created_at?: string
					id?: string
					metadata?: Json
					name: string
					updated_at?: string
				}
				Update: {
					bucket_name?: string
					catalog_id?: string
					created_at?: string
					id?: string
					metadata?: Json
					name?: string
					updated_at?: string
				}
				Relationships: [
					{
						foreignKeyName: "iceberg_namespaces_catalog_id_fkey"
						columns: ["catalog_id"]
						referencedRelation: "buckets_analytics"
						referencedColumns: ["id"]
					}
				]
			}
			iceberg_tables: {
				Row: {
					bucket_name: string
					catalog_id: string
					created_at: string
					id: string
					location: string
					name: string
					namespace_id: string
					remote_table_id: string | null
					shard_id: string | null
					shard_key: string | null
					updated_at: string
				}
				Insert: {
					bucket_name: string
					catalog_id: string
					created_at?: string
					id?: string
					location: string
					name: string
					namespace_id: string
					remote_table_id?: string | null
					shard_id?: string | null
					shard_key?: string | null
					updated_at?: string
				}
				Update: {
					bucket_name?: string
					catalog_id?: string
					created_at?: string
					id?: string
					location?: string
					name?: string
					namespace_id?: string
					remote_table_id?: string | null
					shard_id?: string | null
					shard_key?: string | null
					updated_at?: string
				}
				Relationships: [
					{
						foreignKeyName: "iceberg_tables_catalog_id_fkey"
						columns: ["catalog_id"]
						referencedRelation: "buckets_analytics"
						referencedColumns: ["id"]
					},
					{
						foreignKeyName: "iceberg_tables_namespace_id_fkey"
						columns: ["namespace_id"]
						referencedRelation: "iceberg_namespaces"
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
					owner_id: string | null
					path_tokens: string[] | null
					updated_at: string | null
					user_metadata: Json | null
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
					owner_id?: string | null
					path_tokens?: string[] | null
					updated_at?: string | null
					user_metadata?: Json | null
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
					owner_id?: string | null
					path_tokens?: string[] | null
					updated_at?: string | null
					user_metadata?: Json | null
					version?: string | null
				}
				Relationships: [
					{
						foreignKeyName: "objects_bucketId_fkey"
						columns: ["bucket_id"]
						referencedRelation: "buckets"
						referencedColumns: ["id"]
					}
				]
			}
			s3_multipart_uploads: {
				Row: {
					bucket_id: string
					created_at: string
					id: string
					in_progress_size: number
					key: string
					owner_id: string | null
					upload_signature: string
					user_metadata: Json | null
					version: string
				}
				Insert: {
					bucket_id: string
					created_at?: string
					id: string
					in_progress_size?: number
					key: string
					owner_id?: string | null
					upload_signature: string
					user_metadata?: Json | null
					version: string
				}
				Update: {
					bucket_id?: string
					created_at?: string
					id?: string
					in_progress_size?: number
					key?: string
					owner_id?: string | null
					upload_signature?: string
					user_metadata?: Json | null
					version?: string
				}
				Relationships: [
					{
						foreignKeyName: "s3_multipart_uploads_bucket_id_fkey"
						columns: ["bucket_id"]
						referencedRelation: "buckets"
						referencedColumns: ["id"]
					}
				]
			}
			s3_multipart_uploads_parts: {
				Row: {
					bucket_id: string
					created_at: string
					etag: string
					id: string
					key: string
					owner_id: string | null
					part_number: number
					size: number
					upload_id: string
					version: string
				}
				Insert: {
					bucket_id: string
					created_at?: string
					etag: string
					id?: string
					key: string
					owner_id?: string | null
					part_number: number
					size?: number
					upload_id: string
					version: string
				}
				Update: {
					bucket_id?: string
					created_at?: string
					etag?: string
					id?: string
					key?: string
					owner_id?: string | null
					part_number?: number
					size?: number
					upload_id?: string
					version?: string
				}
				Relationships: [
					{
						foreignKeyName: "s3_multipart_uploads_parts_bucket_id_fkey"
						columns: ["bucket_id"]
						referencedRelation: "buckets"
						referencedColumns: ["id"]
					},
					{
						foreignKeyName: "s3_multipart_uploads_parts_upload_id_fkey"
						columns: ["upload_id"]
						referencedRelation: "s3_multipart_uploads"
						referencedColumns: ["id"]
					}
				]
			}
			vector_indexes: {
				Row: {
					bucket_id: string
					created_at: string
					data_type: string
					dimension: number
					distance_metric: string
					id: string
					metadata_configuration: Json | null
					name: string
					updated_at: string
				}
				Insert: {
					bucket_id: string
					created_at?: string
					data_type: string
					dimension: number
					distance_metric: string
					id?: string
					metadata_configuration?: Json | null
					name: string
					updated_at?: string
				}
				Update: {
					bucket_id?: string
					created_at?: string
					data_type?: string
					dimension?: number
					distance_metric?: string
					id?: string
					metadata_configuration?: Json | null
					name?: string
					updated_at?: string
				}
				Relationships: [
					{
						foreignKeyName: "vector_indexes_bucket_id_fkey"
						columns: ["bucket_id"]
						referencedRelation: "buckets_vectors"
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
				Args: { bucketid: string; metadata: Json; name: string; owner: string }
				Returns: undefined
			}
			extension: { Args: { name: string }; Returns: string }
			filename: { Args: { name: string }; Returns: string }
			foldername: { Args: { name: string }; Returns: string[] }
			get_common_prefix: {
				Args: { p_delimiter: string; p_key: string; p_prefix: string }
				Returns: string
			}
			get_level: { Args: { name: string }; Returns: number }
			get_prefix: { Args: { name: string }; Returns: string }
			get_prefixes: { Args: { name: string }; Returns: string[] }
			get_size_by_bucket: {
				Args: never
				Returns: {
					bucket_id: string
					size: number
				}[]
			}
			list_multipart_uploads_with_delimiter: {
				Args: {
					bucket_id: string
					delimiter_param: string
					max_keys?: number
					next_key_token?: string
					next_upload_token?: string
					prefix_param: string
				}
				Returns: {
					created_at: string
					id: string
					key: string
				}[]
			}
			list_objects_with_delimiter: {
				Args: {
					_bucket_id: string
					delimiter_param: string
					max_keys?: number
					next_token?: string
					prefix_param: string
					sort_order?: string
					start_after?: string
				}
				Returns: {
					created_at: string
					id: string
					last_accessed_at: string
					metadata: Json
					name: string
					updated_at: string
				}[]
			}
			operation: { Args: never; Returns: string }
			search: {
				Args: {
					bucketname: string
					levels?: number
					limits?: number
					offsets?: number
					prefix: string
					search?: string
					sortcolumn?: string
					sortorder?: string
				}
				Returns: {
					created_at: string
					id: string
					last_accessed_at: string
					metadata: Json
					name: string
					updated_at: string
				}[]
			}
			search_by_timestamp: {
				Args: {
					p_bucket_id: string
					p_level: number
					p_limit: number
					p_prefix: string
					p_sort_column: string
					p_sort_column_after: string
					p_sort_order: string
					p_start_after: string
				}
				Returns: {
					created_at: string
					id: string
					key: string
					last_accessed_at: string
					metadata: Json
					name: string
					updated_at: string
				}[]
			}
			search_legacy_v1: {
				Args: {
					bucketname: string
					levels?: number
					limits?: number
					offsets?: number
					prefix: string
					search?: string
					sortcolumn?: string
					sortorder?: string
				}
				Returns: {
					created_at: string
					id: string
					last_accessed_at: string
					metadata: Json
					name: string
					updated_at: string
				}[]
			}
			search_v2: {
				Args: {
					bucket_name: string
					levels?: number
					limits?: number
					prefix: string
					sort_column?: string
					sort_column_after?: string
					sort_order?: string
					start_after?: string
				}
				Returns: {
					created_at: string
					id: string
					key: string
					last_accessed_at: string
					metadata: Json
					name: string
					updated_at: string
				}[]
			}
		}
		Enums: {
			buckettype: "STANDARD" | "ANALYTICS" | "VECTOR"
		}
		CompositeTypes: {
			[_ in never]: never
		}
	}
	stripe: {
		Tables: {
			customers: {
				Row: {
					attrs: Json | null
					created: string | null
					description: string | null
					email: string | null
					id: string | null
					name: string | null
				}
				Insert: {
					attrs?: Json | null
					created?: string | null
					description?: string | null
					email?: string | null
					id?: string | null
					name?: string | null
				}
				Update: {
					attrs?: Json | null
					created?: string | null
					description?: string | null
					email?: string | null
					id?: string | null
					name?: string | null
				}
				Relationships: []
			}
			invoices: {
				Row: {
					attrs: Json | null
					currency: string | null
					customer: string | null
					id: string | null
					period_end: string | null
					period_start: string | null
					status: string | null
					subscription: string | null
					total: number | null
				}
				Insert: {
					attrs?: Json | null
					currency?: string | null
					customer?: string | null
					id?: string | null
					period_end?: string | null
					period_start?: string | null
					status?: string | null
					subscription?: string | null
					total?: number | null
				}
				Update: {
					attrs?: Json | null
					currency?: string | null
					customer?: string | null
					id?: string | null
					period_end?: string | null
					period_start?: string | null
					status?: string | null
					subscription?: string | null
					total?: number | null
				}
				Relationships: []
			}
			products: {
				Row: {
					active: boolean | null
					attrs: Json | null
					created: string | null
					default_price: string | null
					description: string | null
					id: string | null
					name: string | null
					updated: string | null
				}
				Insert: {
					active?: boolean | null
					attrs?: Json | null
					created?: string | null
					default_price?: string | null
					description?: string | null
					id?: string | null
					name?: string | null
					updated?: string | null
				}
				Update: {
					active?: boolean | null
					attrs?: Json | null
					created?: string | null
					default_price?: string | null
					description?: string | null
					id?: string | null
					name?: string | null
					updated?: string | null
				}
				Relationships: []
			}
			subscriptions: {
				Row: {
					attrs: Json | null
					currency: string | null
					current_period_end: string | null
					current_period_start: string | null
					customer: string | null
					id: string | null
				}
				Insert: {
					attrs?: Json | null
					currency?: string | null
					current_period_end?: string | null
					current_period_start?: string | null
					customer?: string | null
					id?: string | null
				}
				Update: {
					attrs?: Json | null
					currency?: string | null
					current_period_end?: string | null
					current_period_start?: string | null
					customer?: string | null
					id?: string | null
				}
				Relationships: []
			}
		}
		Views: {
			[_ in never]: never
		}
		Functions: {
			[_ in never]: never
		}
		Enums: {
			[_ in never]: never
		}
		CompositeTypes: {
			[_ in never]: never
		}
	}
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
	DefaultSchemaTableNameOrOptions extends
		| keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
		| { schema: keyof DatabaseWithoutInternals },
	TableName extends DefaultSchemaTableNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals
	}
		? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
				DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
		: never = never
> = DefaultSchemaTableNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals
}
	? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
			DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
			Row: infer R
		}
		? R
		: never
	: DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
		? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
				Row: infer R
			}
			? R
			: never
		: never

export type TablesInsert<
	DefaultSchemaTableNameOrOptions extends
		| keyof DefaultSchema["Tables"]
		| { schema: keyof DatabaseWithoutInternals },
	TableName extends DefaultSchemaTableNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals
	}
		? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
		: never = never
> = DefaultSchemaTableNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals
}
	? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
			Insert: infer I
		}
		? I
		: never
	: DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
		? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
				Insert: infer I
			}
			? I
			: never
		: never

export type TablesUpdate<
	DefaultSchemaTableNameOrOptions extends
		| keyof DefaultSchema["Tables"]
		| { schema: keyof DatabaseWithoutInternals },
	TableName extends DefaultSchemaTableNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals
	}
		? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
		: never = never
> = DefaultSchemaTableNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals
}
	? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
			Update: infer U
		}
		? U
		: never
	: DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
		? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
				Update: infer U
			}
			? U
			: never
		: never

export type Enums<
	DefaultSchemaEnumNameOrOptions extends
		| keyof DefaultSchema["Enums"]
		| { schema: keyof DatabaseWithoutInternals },
	EnumName extends DefaultSchemaEnumNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals
	}
		? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
		: never = never
> = DefaultSchemaEnumNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals
}
	? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
	: DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
		? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
		: never

export type CompositeTypes<
	PublicCompositeTypeNameOrOptions extends
		| keyof DefaultSchema["CompositeTypes"]
		| { schema: keyof DatabaseWithoutInternals },
	CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals
	}
		? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
		: never = never
> = PublicCompositeTypeNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals
}
	? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
	: PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
		? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
		: never

export const Constants = {
	_supavisor: {
		Enums: {}
	},
	graphql_public: {
		Enums: {}
	},
	info: {
		Enums: {}
	},
	pgbouncer: {
		Enums: {}
	},
	profiles: {
		Enums: {}
	},
	public: {
		Enums: {
			script_category: [
				"combat",
				"boss",
				"minigame",
				"moneymaker",
				"tool",
				"magic",
				"prayer",
				"mining",
				"fishing",
				"woodcutting",
				"hunter",
				"farming",
				"cooking",
				"smithing",
				"fletching",
				"firemaking",
				"herblore",
				"crafting",
				"construction",
				"agility",
				"slayer",
				"thieving",
				"runecrafting"
			],
			script_status: ["official", "community"],
			script_type: ["premium", "free"]
		}
	},
	scripts: {
		Enums: {
			status: ["Official", "Community"]
		}
	},
	storage: {
		Enums: {
			buckettype: ["STANDARD", "ANALYTICS", "VECTOR"]
		}
	},
	stripe: {
		Enums: {}
	}
} as const
