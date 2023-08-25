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
			.schema("profiles")
			.from("profiles")
			.select(
				`id, discord, username, avatar, private!left (email, warning),
				roles!left (banned, timeout, developer, premium, vip, tester, scripter, moderator, administrator),
				subscriptions!left (customer_id, external, subscription_id, cancel, price_id, date_start, date_end)`
			)
			.eq("id", id)
			.limit(1)
			.limit(1, { foreignTable: "private" })
			.limit(1, { foreignTable: "roles" })
			.limit(1, { foreignTable: "subscriptions" })
			.returns<Profile[]>()

		if (error) {
			console.error(error)
			return null
		}

		if (data.length === 0) {
			return null
		}

		const profile = data[0]

		let needUpdate = !profile.subscriptions.customer_id

		if (!profile.subscriptions.external) {
			const startDate = Date.parse(profile.subscriptions.date_start ?? "0")
			const endDate = Date.parse(profile.subscriptions.date_end ?? "0")
			const now = Date.now()

			if (endDate - now < 0) {
				if (profile.roles.vip) {
					profile.roles.vip = false
					needUpdate = true
				}

				if (profile.roles.premium) {
					profile.roles.premium = false
					needUpdate = true
				}
			} else {
				const THREE_MONTHS = 7889400000
				if (endDate - startDate > THREE_MONTHS && !profile.roles.vip) {
					needUpdate = true
					profile.roles.vip = true
				}

				if (!profile.roles.premium) {
					needUpdate = true
					profile.roles.premium = true
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
