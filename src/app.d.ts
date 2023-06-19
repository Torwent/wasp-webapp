import type { SupabaseClient, Session } from "@supabase/supabase-js"
import type { Profile } from "$lib/backend/types"

declare global {
	namespace App {
		interface Locals {
			supabaseServer: SupabaseClient
			getSession(): Promise<Session | null>
			getProfile(): Promise<Profile | null>
			warningDismissed: boolean
		}
		interface PageData {
			session: Session | null
			profile: Profile | null
			warningDismissed: boolean
		}
		// interface Error {}
		// interface Platform {}
	}
}
