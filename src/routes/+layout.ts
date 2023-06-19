import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from "$env/static/public"
import { createSupabaseLoadClient } from "@supabase/auth-helpers-sveltekit"

export const load = async ({ fetch, data }) => {
	/* const didLogout = url.searchParams.has("/logout")
	if (didLogout) await data.supabase.auth.signOut() */

	const supabaseClient = createSupabaseLoadClient({
		supabaseUrl: PUBLIC_SUPABASE_URL,
		supabaseKey: PUBLIC_SUPABASE_ANON_KEY,
		event: { fetch },
		serverSession: data.session
	})

	const {
		data: { session }
	} = await supabaseClient.auth.getSession()

	return { supabaseClient, session, profile: data.profile }
}
