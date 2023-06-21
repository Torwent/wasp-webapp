import type { Handle } from "@sveltejs/kit"
import type { Profile } from "$lib/backend/types"
import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from "$env/static/public"
import { createSupabaseServerClient } from "@supabase/auth-helpers-sveltekit"
import { API_URL } from "$lib/utils"

export const handle: Handle = async ({ event, resolve }) => {
	const start = performance.now()
	const route = event.url
	console.log("here0")
	const warningDismissed = event.cookies.get("warningDismissed")
	console.log("here1")
	event.locals.supabaseServer = createSupabaseServerClient({
		supabaseUrl: PUBLIC_SUPABASE_URL,
		supabaseKey: PUBLIC_SUPABASE_ANON_KEY,
		event
	})
	console.log("here2")
	event.locals.getSession = async () => {
		const {
			data: { session }
		} = await event.locals.supabaseServer.auth.getSession()
		return session
	}
	console.log("here3")
	event.locals.getProfile = async () => {
		const session = await event.locals.getSession()
		if (!session) return null

		const id = session.user.id
		const { data, error } = await event.locals.supabaseServer
			.from("profiles_public")
			.select(
				`id, discord_id, username, avatar_url,
      		profiles_protected (developer, premium, vip, tester, scripter, moderator, administrator),
			profiles_private (dismissed_warning)`
			)
			.eq("id", id)

		if (error) return null
		return data[0] as unknown as Profile
	}
	console.log("here4")
	const profile = await event.locals.getProfile()
	console.log("here5")
	if (profile) {
		try {
			await event.fetch(API_URL + "/discord/refresh/" + profile.discord_id, {
				method: "GET"
			})
		} catch (error) {
			console.error(error)
		}
	}
	console.log("here6")

	event.locals.warningDismissed = warningDismissed === "true"
	console.log("here7")
	const response = await resolve(event, {
		filterSerializedResponseHeaders(name) {
			return name === "content-range"
		}
	})
	console.log("here8")
	const loadTime = performance.now() - start
	if (loadTime < 3000) console.log(`🚀 ${route} took ${loadTime.toFixed(2)} ms to load!`)
	else console.log(`🐌 ${route} took ${loadTime.toFixed(2)} ms to load!`)

	return response
}
