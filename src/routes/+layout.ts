import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from "$env/static/public"
import { createSupabaseLoadClient } from "@supabase/auth-helpers-sveltekit"
import type { LayoutLoad } from "./$types"
import { API_URL } from "$lib/utils"
import type { Profile } from "$lib/backend/types"

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

	const currentSession = data.session
	if (currentSession) {
		const { data, error: err1 } = await supabase.auth.setSession({
			access_token: currentSession.access_token,
			refresh_token: currentSession.refresh_token
		})

		if (err1) console.error("error1: ", err1)
		else console.log(data.user?.id)
	}
	const {
		data: { session },
		error: err2
	} = await supabase.auth.getSession()

	console.log("server session: ", data.session?.user.id)
	console.log("client session: ", session?.user.id)

	if (err2) console.error("error2: ", err2)

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
