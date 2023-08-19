import type { SupabaseClient, Session } from "@supabase/supabase-js"
import type { Database } from "$lib/types/supabase"
import type { Profile } from "$lib/types/collection"

declare global {
	namespace App {
		interface Locals {
			supabaseServer: SupabaseClient<Database>
			getSession(): Promise<Session | null>
			getProfile(): Promise<Profile | null>
			profile: Profile | null
		}
		interface PageData {
			supabaseClient: SupabaseClient<Database>
			session: Session | null
			profile: Profile | null
		}
		// interface Error {}
		// interface Platform {}
	}
}
