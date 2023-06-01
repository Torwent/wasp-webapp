import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from "$env/static/public"
import type { Profile } from "$lib/backend/types"
import { createSupabaseServerClient } from "@supabase/auth-helpers-sveltekit"
import type { Handle } from "@sveltejs/kit"

export const handle: Handle = async ({ event, resolve }) => {
	const start = performance.now()
	const route = event.url

	event.locals.supabase = createSupabaseServerClient({
		supabaseUrl: PUBLIC_SUPABASE_URL,
		supabaseKey: PUBLIC_SUPABASE_ANON_KEY,
		event
	})

	event.locals.getSession = async () => {
		const {
			data: { session }
		} = await event.locals.supabase.auth.getSession()
		return session
	}

	event.locals.getProfile = async () => {
		const session = await event.locals.getSession()
		if (!session) return null

		const id = session.user.id
		const { data, error } = await event.locals.supabase
			.from("profiles_public")
			.select(
				`id, discord_id, username, avatar_url,
      		profiles_protected (developer, premium, vip, tester, moderator, administrator),
			profiles_private (dismissed_warning)`
			)
			.eq("id", id)

		if (error) return null

		const profile = data[0] as Profile

		return profile
	}

	let warning = event.cookies.get("warningDismissed")
	if (warning == null) warning = "false"
	event.locals.warningDismissed = warning === "true"

	const response = await resolve(event, {
		filterSerializedResponseHeaders(name) {
			return name === "content-range"
		}
	})
	const loadTime = performance.now() - start

	if (loadTime > 2000) console.log(`🚀 ${route} took ${loadTime.toFixed(2)} ms to load!`)

	return response
}
