import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from "$env/static/public"
import { createSupabaseLoadClient } from "@supabase/auth-helpers-sveltekit"
import type { LayoutLoad } from "./$types"
import { supabaseStore } from "$lib/backend/auth"

export const load: LayoutLoad = async ({ fetch, data, depends }) => {
	depends("supabase:auth")

	const supabase = createSupabaseLoadClient({
		supabaseUrl: PUBLIC_SUPABASE_URL,
		supabaseKey: PUBLIC_SUPABASE_ANON_KEY,
		event: { fetch },
		serverSession: data.session
	})
	supabaseStore.set(supabase)

	const {
		data: { session }
	} = await supabase.auth.getSession()

	console.log("serverSession: ", data.session?.user.id)
	console.log("HelperSession: ", session?.user.id)

	return { supabase, session, profile: data.profile }
}
