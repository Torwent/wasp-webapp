import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from "$env/static/public"
import type { LayoutLoad } from "./$types"
import { getProfile } from "$lib/backend/data"
import { API_URL } from "$lib/utils"
import type { Profile } from "$lib/backend/types"
import { createSupabaseLoadClient } from "@supabase/auth-helpers-sveltekit"
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

	async function checkProfileUpdates(profile: Profile | false) {
		if (profile)
			await fetch(API_URL + "/discord/refresh/" + profile.discord_id, { method: "GET" }).catch(
				(error) => console.error(error)
			)
		setTimeout(checkProfileUpdates, 10000)
	}

	const profile = await getProfile()
	checkProfileUpdates(profile)

	return { supabase, session, profile }
}
