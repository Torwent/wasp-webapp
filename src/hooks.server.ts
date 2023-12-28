import { error, type Handle } from "@sveltejs/kit"
import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from "$env/static/public"
import { createSupabaseServerClient } from "@supabase/auth-helpers-sveltekit"
import type { Profile } from "$lib/types/collection"

export const handle: Handle = async ({ event, resolve }) => {
	const start = performance.now()

	const { url, locals } = event

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
		const { data, error: err } = await locals.supabaseServer
			.schema("profiles")
			.from("profiles")
			.select(
				`id, discord, username, avatar, customer_id,
				 private!private_id_fkey (email, warning),
				 roles!roles_id_fkey (banned, tester, scripter, moderator, administrator),
				 subscription!subscription_id_fkey (subscription, product, price, date_start, date_end, cancel)`
			)
			.eq("id", id)
			.limit(1)
			.limit(1, { foreignTable: "private" })
			.limit(1, { foreignTable: "roles" })
			.returns<Profile[]>()

		if (err || data.length < 1) return null

		const profile = data[0]
		if (profile.roles.banned) throw error(403, "You've been banned!")

		return profile
	}

	const response = await resolve(event, {
		filterSerializedResponseHeaders(name) {
			return name === "content-range"
		}
	})

	response.headers.delete("link")

	const loadTime = performance.now() - start
	if (loadTime < 3000) console.log(`🚀 ${url} took ${loadTime.toFixed(2)} ms to load!`)
	else console.log(`🐌 ${url} took ${loadTime.toFixed(2)} ms to load!`)

	return response
}
