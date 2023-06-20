import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from "$env/static/public"
import { createSupabaseLoadClient } from "@supabase/auth-helpers-sveltekit"

export const load = async ({ fetch, data, depends }) => {
	depends("supabase:auth")
	const supabaseClient = createSupabaseLoadClient({
		supabaseUrl: PUBLIC_SUPABASE_URL,
		supabaseKey: PUBLIC_SUPABASE_ANON_KEY,
		event: { fetch },
		serverSession: data.session
	})

	const {
		data: { session }
	} = await supabaseClient.auth.getSession()

	console.log("server server: ", data.session?.user.id)
	console.log("server client: ", session?.user.id)

	return { supabaseClient, session, serverSession: data.session, profile: data.profile }
}
