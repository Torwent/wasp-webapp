import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from "$env/static/public"
import type { Profile } from "$lib/types/collection"
import type { Database } from "$lib/types/supabase"
import { createSupabaseLoadClient } from "@supabase/auth-helpers-sveltekit"

export const load = async ({ fetch, data, depends }) => {
	depends("supabase:auth")
	const supabaseClient = createSupabaseLoadClient<Database>({
		supabaseUrl: PUBLIC_SUPABASE_URL,
		supabaseKey: PUBLIC_SUPABASE_ANON_KEY,
		event: { fetch },
		serverSession: data.session
	})

	const {
		data: { session }
	} = await supabaseClient.auth.getSession()

	const getProfile = async () => {
		if (!session) return null

		const id = session.user.id
		const { data, error } = await supabaseClient
			.from("profiles_public")
			.select(`*, profiles_protected (*, prices (*)), profiles_private (*)`)
			.eq("id", id)
			.returns<Profile[]>()

		if (error || data.length === 0) return null
		return data[0]
	}

	return { supabaseClient, session, profile: getProfile() }
}
