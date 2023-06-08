import type { TypedSupabaseClient } from "@supabase/auth-helpers-sveltekit/dist/types"
import type { Session } from "@supabase/supabase-js"
import type { Profile } from "$lib/backend/types"

declare global {
	namespace App {
		interface Locals {
			warningDismissed: boolean
			supabase: TypedSupabaseClient
			getSession(): Promise<Session | null>
			getProfile(): Promise<Profile | null>
		}
		interface PageData {
			session: Session | null
			profile: Profile | null
		}
		// interface Error {}
		// interface Platform {}
	}
}
