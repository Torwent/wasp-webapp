import { type Handle, redirect } from "@sveltejs/kit"
import { paraglideMiddleware } from "$lib/paraglide/server"

import { createServerClient } from "@supabase/ssr"
import { sequence } from "@sveltejs/kit/hooks"
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from "$env/static/public"
import type { Database } from "$lib/types/supabase"

const redirects: Handle = async ({ event, resolve }) => {
	if (event.url.pathname.startsWith("/refresh_token")) {
		return redirect(303, "/auth/refresh-token")
	}

	if (event.url.pathname.startsWith("/auth/callback")) {
		const path = event.url.pathname.slice(14)
		if (path === "") return resolve(event)

		const searchParams =
			event.url.searchParams.toString() + "&path=" + encodeURI(path.replaceAll("_-_", "/"))

		return redirect(303, "/auth/callback?" + searchParams)
	}
	return resolve(event)
}

const supabase: Handle = async ({ event, resolve }) => {
	event.locals.supabaseServer = createServerClient<Database>(
		PUBLIC_SUPABASE_URL,
		PUBLIC_SUPABASE_ANON_KEY,
		{
			cookies: {
				getAll: () => event.cookies.getAll(),
				setAll: (cookiesToSet) => {
					cookiesToSet.forEach(({ name, value, options }) => {
						event.cookies.set(name, value, { ...options, path: "/" })
					})
				}
			}
		}
	)

	event.locals.safeGetSession = async () => {
		let start = performance.now()

		const {
			data: { session }
		} = await event.locals.supabaseServer.auth.getSession()

		if (!session) return { session: null, user: null, getProfile: null }
		console.log(`└📜 session took ${(performance.now() - start).toFixed(2)} ms to check!`)

		start = performance.now()

		const {
			data: { user },
			error: err
		} = await event.locals.supabaseServer.auth.getUser()

		if (err) return { session: null, user: null, getProfile: null }

		console.log(`└🔥 user took ${(performance.now() - start).toFixed(2)} ms to check!`)

		if (!user) return { session: null, user: null, getProfile: null }

		try {
			console.log(`└😄 user ${user.id} accessing from ${event.getClientAddress()}`)
		} catch {
			console.log(`└😄 user ${user.id} accessing from NO IP`)
		}

		// @ts-expect-error workaround supabase ssr session user weirdness
		delete session.user

		return {
			session: Object.assign({}, session, { user }),
			user
		}
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
		if (!user) return []
		const { data, error: err } = await event.locals.supabaseServer
			.schema("profiles")
			.from("subscription")
			.select("subscription, product, price, date_start, date_end, cancel, disabled")
			.eq("id", user.id)

		if (err) return []
		return data
	}

	event.locals.getFreeAccess = async () => {
		if (!user) return []
		const { data, error: err } = await event.locals.supabaseServer
			.schema("profiles")
			.from("free_access")
			.select("id, product, date_start, date_end")
			.eq("id", user.id)

		if (err) return []
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
		event.cookies.set("theme", "wasp", { path: "/" })
	}

	return await resolve(event, {
		transformPageChunk: ({ html }) =>
			html.replace('data-theme=""', `data-theme="${cookieTheme ?? "wasp"}"`)
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

const handleParaglide: Handle = ({ event, resolve }) =>
	paraglideMiddleware(event.request, ({ request, locale }) => {
		event.request = request

		return resolve(event, {
			transformPageChunk: ({ html }) => html.replace("%paraglide.lang%", locale)
		})
	})

export const handle: Handle = sequence(
	redirects,
	darkMode,
	theme,
	supabase,
	authGuard,
	handleParaglide,
	performanceCheck
)
