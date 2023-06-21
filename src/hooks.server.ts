import type { Handle } from "@sveltejs/kit"
import type { Profile } from "$lib/backend/types"
import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from "$env/static/public"
import { createSupabaseServerClient } from "@supabase/auth-helpers-sveltekit"
import { API_URL } from "$lib/utils"

export const handle: Handle = async ({ event, resolve }) => {
	const start = performance.now()
	const route = event.url

	const warningDismissed = event.cookies.get("warningDismissed")

	event.locals.supabaseServer = createSupabaseServerClient({
		supabaseUrl: PUBLIC_SUPABASE_URL,
		supabaseKey: PUBLIC_SUPABASE_ANON_KEY,
		event
	})

	event.locals.getSession = async () => {
		const {
			data: { session }
		} = await event.locals.supabaseServer.auth.getSession()
		return session
	}

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

	const profile = await event.locals.getProfile()

	if (profile) {
		try {
			await event.fetch(API_URL + "/discord/refresh/" + profile.discord_id, {
				method: "GET"
			})
		} catch (error) {
			console.error(error)
		}
	}

	event.locals.warningDismissed = warningDismissed === "true"

	const response = await resolve(event, {
		filterSerializedResponseHeaders(name) {
			return name === "content-range"
		}
	})
	response.headers.delete("link")

	const loadTime = performance.now() - start
	if (loadTime < 3000) console.log(`🚀 ${route} took ${loadTime.toFixed(2)} ms to load!`)
	else console.log(`🐌 ${route} took ${loadTime.toFixed(2)} ms to load!`)

	return response
}
