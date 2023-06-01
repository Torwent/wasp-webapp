import { SupabaseClient, Session } from "@supabase/supabase-js"
import type { Profile } from "$lib/backend/types"

declare global {
	namespace App {
		interface Locals {
			warningDismissed: boolean
			supabase: SupabaseClient
			getSession(): Promise<Session | null>
			getProfile(): Promise<Profile | null>
		}
		interface PageData {
			session: Session | null
		}
		// interface Error {}
		// interface Platform {}
	}
}
