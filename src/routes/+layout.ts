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
			.select(
				`id, discord_id, username, avatar_url,
      		profiles_protected (developer, premium, vip, tester, scripter, moderator, administrator),
			profiles_private (dismissed_warning)`
			)
			.eq("id", id)

		if (error) return null
		return data[0] as unknown as Profile
	}

	return { supabaseClient, session, profile: getProfile() }
}
