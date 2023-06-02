import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from "$env/static/public"
import type { LayoutLoad } from "./$types"
import { API_URL } from "$lib/utils"
import type { Profile } from "$lib/backend/types"
import { createSupabaseLoadClient } from "@supabase/auth-helpers-sveltekit"
import { supabaseStore, user } from "$lib/backend/auth"

export const load: LayoutLoad = async ({ fetch, data, depends }) => {
	depends("supabase:auth")

	const supabase = createSupabaseLoadClient({
		supabaseUrl: PUBLIC_SUPABASE_URL,
		supabaseKey: PUBLIC_SUPABASE_ANON_KEY,
		event: { fetch },
		serverSession: data.session
	})

	supabaseStore.set(supabase)

	user.set(false)
	if (data.session) user.set(data.session.user)

	async function checkProfileUpdates(profile: Profile | null) {
		if (profile) {
			await fetch(API_URL + "/discord/refresh/" + profile.discord_id, { method: "GET" }).catch(
				(error) => console.error(error)
			)
			setTimeout(checkProfileUpdates, 3000)
		}
	}

	checkProfileUpdates(data.profile)

	return { supabase, session: data.session, profile: data.profile }
}
