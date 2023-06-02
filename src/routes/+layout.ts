import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from "$env/static/public"
import type { LayoutLoad } from "./$types"
import { API_URL } from "$lib/utils"
import type { Profile } from "$lib/backend/types"
import { createSupabaseLoadClient } from "@supabase/auth-helpers-sveltekit"
import { supabaseStore, user, getProfile } from "$lib/backend/auth"

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
	if (data.session) {
		supabase.auth.setSession({
			access_token: data.session.access_token,
			refresh_token: data.session.refresh_token
		})
		user.set(data.session.user)

		const {
			data: { session }
		} = await supabase.auth.getSession()

		console.log("client user id: ", session?.user.id)
		console.log("server user id: ", data.session?.user.id)
	}

	const profile = await getProfile()

	async function checkProfileUpdates(currentProfile: Profile | null) {
		if (currentProfile) {
			await fetch(API_URL + "/discord/refresh/" + currentProfile.discord_id, {
				method: "GET"
			}).catch((error) => console.error(error))
			setTimeout(checkProfileUpdates, 3000)
		}
	}

	checkProfileUpdates(profile)

	return { supabase, session: data.session, profile }
}
