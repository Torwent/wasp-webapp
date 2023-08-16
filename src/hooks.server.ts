import type { Handle } from "@sveltejs/kit"
import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from "$env/static/public"
import { createSupabaseServerClient } from "@supabase/auth-helpers-sveltekit"
import { API_URL } from "$lib/utils"
import type { Profile } from "$lib/types/collection"
import { stripe, updateProfileProtected } from "$lib/backend/supabase.server"

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

	const session = await locals.getSession()

	locals.getProfile = async () => {
		if (!session) return null

		const id = session.user.id
		const { data, error: err } = await locals.supabaseServer
			.from("profiles_public")
			.select(`*, profiles_protected!left (*, prices!left (*)), profiles_private!left (*)`)
			.eq("id", id)
			.limit(1)
			.limit(1, { foreignTable: "profiles_protected" })
			.limit(1, { foreignTable: "profiles_private" })
			.returns<Profile[]>()

		if (err || data.length < 1) return null

		const profile = data[0]

		let needUpdate = false
		if (!profile.profiles_protected.customer_id) {
			const customer = await stripe.customers.create({
				email: session.user.email,
				name: session.user.id,
				metadata: {
					id: session.user.id,
					discord_id: profile.discord_id,
					username: profile.username
				}
			})

			profile.profiles_protected.customer_id = customer.id
			needUpdate = true
		}

		if (profile.profiles_protected.subscription_external) {
			fetch(API_URL + "/discord/refresh/" + profile.discord_id, {
				method: "GET"
			}).catch((err) => console.error(err))
		} else {
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
		const promises = []
		if (needUpdate) promises.push(updateProfileProtected(profile))
		if (!profile.profiles_protected.subscription_external)
			promises.push(
				fetch(API_URL + "/discord/update/" + profile.discord_id, {
					method: "GET"
				}).catch((err) => console.error(err))
			)

		Promise.all(promises)

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
