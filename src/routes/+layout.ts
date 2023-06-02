import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from "$env/static/public"
import type { LayoutLoad } from "./$types"
import { API_URL } from "$lib/utils"
import type { Profile } from "$lib/backend/types"
import { createSupabaseLoadClient } from "@supabase/auth-helpers-sveltekit"
import { supabaseStore, user, getProfile } from "$lib/backend/auth"

export const load: LayoutLoad = async ({ fetch, data, depends }) => {
	depends("supabase:auth")

	console.log("server session: ", data.session?.user.id)

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

	console.log("client session: ", session?.user.id)
	console.log("server session2: ", data.session?.user.id)

	user.set(false)
	if (session) user.set(session.user)

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

	return { supabase, session, profile }
}
