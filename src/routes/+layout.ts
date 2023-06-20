import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from "$env/static/public"
import type { Profile } from "$lib/backend/types"
import { createSupabaseLoadClient } from "@supabase/auth-helpers-sveltekit"

export const load = async ({ fetch, data, depends }) => {
	depends("supabase:auth")
	const supabaseClient = createSupabaseLoadClient({
		supabaseUrl: PUBLIC_SUPABASE_URL,
		supabaseKey: PUBLIC_SUPABASE_ANON_KEY,
		event: { fetch },
		serverSession: data.session
	})

	let {
		data: { session }
	} = await supabaseClient.auth.getSession()

	if (data.session && !session) {
		await supabaseClient.auth.setSession(data.session)
		const {
			data: { session: tmp }
		} = await supabaseClient.auth.getSession()

		session = tmp
	}

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

	console.log("server server: ", data.session?.user.id)
	console.log("server client: ", session?.user.id)

	return { supabaseClient, session, serverSession: data.session, profile: getProfile() }
}
