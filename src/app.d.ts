import type { Session, SupabaseClient, User } from "@supabase/supabase-js"
import type { Database } from "$lib/types/supabase"
import type { ProfileBase, ProfileRoles, Subscription, FreeAccess } from "$lib/types/collection"

// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces

declare global {
	namespace App {
		interface Locals {
			supabaseServer: SupabaseClient
			safeGetSession: () => Promise<{ session: Session | null; user: User | null }>

			session: Session | null
			user: User | null
			getProfile: () => Promise<ProfileBase | null> | null
			getRoles: () => Promise<ProfileRoles | null> | null
			getSubscriptions: () => Promise<Subscription[] | null> | null
			getFreeAccess: () => Promise<FreeAccess[] | null> | null
		}
		interface PageData {
			darkMode: boolean
			theme: string
			supabaseClient: SupabaseClient<Database>
			session: Session | null
			user: User | null
			profile: ProfileBase | null
			roles: ProfileRoles | null
		}
		// interface Error {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {}
