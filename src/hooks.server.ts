import { createServerClient } from "@supabase/ssr"
import { type Handle, redirect } from "@sveltejs/kit"
import { sequence } from "@sveltejs/kit/hooks"

import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from "$env/static/public"

const redirects: Handle = async ({ event, resolve }) => {
	if (event.url.pathname.startsWith("/refresh_token")) {
		return redirect(303, "/auth/refresh-token")
	}

	if (event.url.pathname.startsWith("/auth/callback")) {
		const slug = event.url.pathname.slice(14)
		if (slug === "") return resolve(event)
		const searchParams = event.url.searchParams.toString() + "&path=" + encodeURI(slug)
		console.log(searchParams)
		return redirect(303, "/auth/callback?" + searchParams)
	}
	return resolve(event)
}

const supabase: Handle = async ({ event, resolve }) => {
	event.locals.supabaseServer = createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
		cookies: {
			getAll: () => event.cookies.getAll(),
			setAll: (cookiesToSet) => {
				cookiesToSet.forEach(({ name, value, options }) => {
					event.cookies.set(name, value, { ...options, path: "/" })
				})
			}
		}
	})

	event.locals.safeGetSession = async () => {
		const {
			data: { session }
		} = await event.locals.supabaseServer.auth.getSession()

		if (!session) return { session: null, user: null }

		const {
			data: { user },
			error: err
		} = await event.locals.supabaseServer.auth.getUser()
		if (err) return { session: null, user: null } // JWT validation has failed

		return { session, user }
	}

	return resolve(event, {
		filterSerializedResponseHeaders(name) {
			return name === "content-range" || name === "x-supabase-api-version"
		}
	})
}

const authGuard: Handle = async ({ event, resolve }) => {
	const { session, user } = await event.locals.safeGetSession()
	event.locals.session = session
	event.locals.user = user

	event.locals.getProfile = async () => {
		if (!user) return null

		const { data, error: err } = await event.locals.supabaseServer
			.schema("profiles")
			.from("profiles")
			.select("id, discord, username, avatar, customer_id")
			.eq("id", user.id)
			.single()

		if (err) return null
		return data
	}

	event.locals.getRoles = async () => {
		if (!user) return null

		const { data, error: err } = await event.locals.supabaseServer
			.schema("profiles")
			.from("roles")
			.select("banned, premium, vip, tester, scripter, moderator, administrator")
			.eq("id", user.id)
			.single()

		if (err) return null
		return data
	}

	event.locals.getSubscriptions = async () => {
		if (!user) return null
		const { data, error: err } = await event.locals.supabaseServer
			.schema("profiles")
			.from("subscription")
			.select("subscription, product, price, date_start, date_end, cancel, disabled")
			.eq("id", user.id)

		if (err) return null
		return data
	}

	event.locals.getFreeAccess = async () => {
		if (!user) return null
		const { data, error: err } = await event.locals.supabaseServer
			.schema("profiles")
			.from("free_access")
			.select("id, product, date_start, date_end")
			.eq("id", user.id)

		if (err) return null
		return data
	}

	if (!event.locals.session && event.url.pathname.startsWith("/dashboard")) {
		return redirect(303, "/auth")
	}

	const response = resolve(event)
	return response
}

const darkMode: Handle = async ({ event, resolve }) => {
	let dark = event.cookies.get("darkMode")

	if (!dark) {
		dark = "true"
		event.cookies.set("darkMode", dark, { path: "/", maxAge: 60 * 60 * 24 * 7 * 360 })
	}

	const darkMode = dark === "true"
	if (!darkMode) return await resolve(event)

	return await resolve(event, {
		transformPageChunk: ({ html }) => html.replace('class=""', `class="dark"`)
	})
}

const theme: Handle = async ({ event, resolve }) => {
	const cookieTheme = event.cookies.get("theme")

	if (!cookieTheme) {
		event.cookies.set("theme", "skeleton", { path: "/" })
	}

	return await resolve(event, {
		transformPageChunk: ({ html }) =>
			html.replace('data-theme=""', `data-theme="${cookieTheme ?? "fennec"}"`)
	})
}

const performanceCheck: Handle = async ({ event, resolve }) => {
	const start = performance.now()
	const { url } = event
	const response = await resolve(event)
	const loadTime = performance.now() - start
	console.log(`└🚀 ${url} took ${loadTime.toFixed(2)} ms to load!`)
	return response
}

export const handle: Handle = sequence(
	redirects,
	darkMode,
	theme,
	supabase,
	authGuard,
	performanceCheck
)
