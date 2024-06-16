import type { ProfileBase, ProfileRoles, Subscription, FreeAccess } from "$lib/types/collection"
import type { Database } from "$lib/types/supabase"
import type { Session, SupabaseClient, User } from "@supabase/supabase-js"

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			supabaseServer: SupabaseClient<Database>
			safeGetSession: () => Promise<{
				session: Session | null
				user: User | null
			}>
			session: Session | null
			user: User | null
			getProfile: () => Promise<ProfileBase | null> | null
			getRoles: () => Promise<ProfileRoles | null> | null
			getSubscriptions: () => Promise<Subscription[] | null> | null
			getFreeAccess: () => Promise<FreeAccess[] | null> | null
		}
		interface PageData {
			supabaseClient: SupabaseClient<Database>
			session: Session | null
			user: User | null
			profile: ProfileBase | null
			roles: ProfileRoles | null
		}
		// interface PageState {}
		// interface Platform {}
	}
}

export {}
