import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from "$env/static/public"
import type { LayoutLoad } from "./$types"
import { API_URL } from "$lib/utils"
import type { Profile } from "$lib/backend/types"
import { createSupabaseLoadClient } from "@supabase/auth-helpers-sveltekit"
import { session, supabaseStore, user, getProfile } from "$lib/backend/auth"

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
		data: { session: currentSession }
	} = await supabase.auth.getSession()
	data.session = currentSession
	session.set(currentSession ? currentSession : false)

	user.set(false)
	if (currentSession) user.set(currentSession.user)

	data.profile = await getProfile()

	async function checkProfileUpdates(profile: Profile | null) {
		if (profile) {
			await fetch(API_URL + "/discord/refresh/" + profile.discord_id, { method: "GET" }).catch(
				(error) => console.error(error)
			)
			setTimeout(checkProfileUpdates, 3000)
		}
	}

	checkProfileUpdates(data.profile)

	return { supabase, session: currentSession, profile: data.profile }
}
