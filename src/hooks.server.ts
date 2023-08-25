import type { Handle } from "@sveltejs/kit"
import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from "$env/static/public"
import { createSupabaseServerClient } from "@supabase/auth-helpers-sveltekit"
import { API_URL } from "$lib/utils"
import type { Profile } from "$lib/types/collection"
import { stripe, updateProfileProtected } from "$lib/backend/supabase.server"
import type Stripe from "stripe"

export const handle: Handle = async ({ event, resolve }) => {
	const start = performance.now()

	const { url, locals, fetch } = event

	locals.supabaseServer = createSupabaseServerClient({
		supabaseUrl: PUBLIC_SUPABASE_URL,
		supabaseKey: PUBLIC_SUPABASE_ANON_KEY,
		event
	})
	locals.supabaseServer

	locals.getSession = async () => {
		const {
			data: { session }
		} = await locals.supabaseServer.auth.getSession()
		return session
	}

	locals.getProfile = async () => {
		const session = await locals.getSession()
		if (!session) return null

		const id = session.user.id
		const { data, error: err } = await locals.supabaseServer
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

		if (err || data.length < 1) return null

		const profile = data[0]

		let needUpdate = false

		if (profile.subscriptions.external) {
			fetch(API_URL + "/discord/refresh/" + profile.discord, {
				method: "GET"
			}).catch((err) => console.error(err))
		} else {
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

		if (needUpdate) await updateProfileProtected(profile)
		if (!profile.subscriptions.external) {
			fetch(API_URL + "/discord/update/" + profile.discord, {
				method: "GET"
			}).catch((err) => console.error(err))
		}

		return profile
	}

	const response = await resolve(event, {
		filterSerializedResponseHeaders(name) {
			return name === "content-range"
		}
	})

	//if (response.status == 404) throw redirect(303, "/")
	response.headers.delete("link")

	const loadTime = performance.now() - start
	if (loadTime < 3000) console.log(`🚀 ${url} took ${loadTime.toFixed(2)} ms to load!`)
	else console.log(`🐌 ${url} took ${loadTime.toFixed(2)} ms to load!`)

	return response
}
