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

	async function getProfile() {
		if (!session) return null

		const id = session.user.id
		const { data, error } = await supabaseClient
			.from("profiles_public")
			.select(`*, profiles_protected!left (*, prices!left (*)), profiles_private!left (*)`)
			.eq("id", id)
			.limit(1)
			.limit(1, { foreignTable: "profiles_protected" })
			.limit(1, { foreignTable: "profiles_private" })
			.returns<Profile[]>()

		if (error || data.length === 0) return null

		const profile = data[0]

		let needUpdate = !profile.profiles_protected.customer_id

		if (!profile.profiles_protected.subscription_external) {
			const startDate = Date.parse(profile.profiles_protected.subscription_start ?? "0")
			const endDate = Date.parse(profile.profiles_protected.subscription_end ?? "0")
			const now = Date.now()

			if (endDate - now < 0) {
				if (profile.profiles_protected.vip) {
					profile.profiles_protected.vip = false
					needUpdate = true
				}

				if (profile.profiles_protected.premium) {
					profile.profiles_protected.premium = false
					needUpdate = true
				}
			} else {
				const THREE_MONTHS = 7889400000
				if (endDate - startDate > THREE_MONTHS && !profile.profiles_protected.vip) {
					needUpdate = true
					profile.profiles_protected.vip = true
				}

				if (!profile.profiles_protected.premium) {
					needUpdate = true
					profile.profiles_protected.premium = true
				}
			}
		}

		if (needUpdate)
			fetch("/api/auth/profile/", {
				method: "GET"
			}).catch((err) => console.error(err))

		return profile
	}

	return { supabaseClient, session, profile: getProfile() }
}
