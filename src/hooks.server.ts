import type { Handle } from "@sveltejs/kit"
import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from "$env/static/public"
import { createSupabaseServerClient } from "@supabase/auth-helpers-sveltekit"
import { API_URL } from "$lib/utils"
import type { Profile } from "$lib/types/collection"
import { updateProfileRoles } from "$lib/backend/supabase.server"
import Stripe from "stripe"
import { PRIVATE_STRIPE_KEY } from "$env/static/private"

export const handle: Handle = async ({ event, resolve }) => {
	const start = performance.now()
	const { url, cookies, locals, fetch } = event

	const warningDismissed = cookies.get("warningDismissed")

	locals.supabaseServer = createSupabaseServerClient({
		supabaseUrl: PUBLIC_SUPABASE_URL,
		supabaseKey: PUBLIC_SUPABASE_ANON_KEY,
		event
	})

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
		const { data, error } = await locals.supabaseServer
			.from("profiles_public")
			.select(`*, profiles_protected (*), profiles_private (*)`)
			.eq("id", id)
			.returns<Profile[]>()
		if (error || data.length < 1) return null
		return data[0]
	}

	const profile = await locals.getProfile()
	locals.stripe = new Stripe(PRIVATE_STRIPE_KEY, { apiVersion: "2022-11-15" })

	if (profile) {
		let needUpdate = false
		if (!profile.profiles_protected.customer_id) {
			const customer = await locals.stripe.customers.create({
				email: profile.profiles_private.email || undefined,
				name: profile.id,
				metadata: { id: profile.id, discord_id: profile.discord_id, username: profile.username }
			})

			profile.profiles_protected.customer_id = customer.id
			needUpdate = true
		}

		if (profile.profiles_protected.subscription_external) {
			await fetch(API_URL + "/discord/refresh/" + profile.discord_id, {
				method: "GET"
			}).catch((err) => console.error(err))
		} else {
			const startDate = profile.profiles_protected.subscription_start
				? Date.parse(profile.profiles_protected.subscription_start)
				: 0

			const endDate = profile.profiles_protected.subscription_end
				? Date.parse(profile.profiles_protected.subscription_end)
				: 0

			const now = Date.now()
			if (endDate - now < 0) {
				profile.profiles_protected.vip = false
				profile.profiles_protected.premium = false
				needUpdate = true
			} else {
				if (endDate - startDate > 7889400000 && !profile.profiles_protected.vip) {
					needUpdate = true
					profile.profiles_protected.vip = true
				}

				if (!profile.profiles_protected.premium) {
					needUpdate = true
					profile.profiles_protected.premium = true
				}
			}
		}
		if (needUpdate) await updateProfileRoles(profile)
	}

	locals.warningDismissed = warningDismissed === "true"

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
