import { createServerClient } from "@supabase/ssr"
import { type Handle, redirect } from "@sveltejs/kit"
import { sequence } from "@sveltejs/kit/hooks"

import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from "$env/static/public"

const redirects: Handle = async ({ event, resolve }) => {
	const start = performance.now()
	if (event.url.pathname.startsWith("/refresh_token")) {
		return redirect(303, "/auth/refresh-token")
	}
	const response = resolve(event)
	console.log(`└🔗 Redirects took ${(performance.now() - start).toFixed(2)} ms to handle!`)

	return response
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
		let start = performance.now()

		const {
			data: { session }
		} = await event.locals.supabaseServer.auth.getSession()

		if (!session) return { session: null, user: null, getProfile: null }
		console.log(`└📜 session took ${(performance.now() - start).toFixed(2)} ms to check!`)

		start = performance.now()

		const {
			data: { user },
			error
		} = await event.locals.supabaseServer.auth.getUser()

		if (error) return { session: null, user: null, getProfile: null }

		console.log(`└🔥 user took ${(performance.now() - start).toFixed(2)} ms to check!`)
		if (user) {
			try {
				console.log(`└😄 user ${user.id} accessing from ${event.getClientAddress()}`)
			} catch (error) {
				console.log(`└😄 user ${user.id} accessing from NO IP`)
			}
		}

		// @ts-expect-error
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
	const start = performance.now()
	const { session, user } = await event.locals.safeGetSession()
	event.locals.session = session
	event.locals.user = user

	event.locals.getProfile = async () => {
		if (!user) return null
		const start = performance.now()
		const { data, error: err } = await event.locals.supabaseServer
			.schema("profiles")
			.from("profiles")
			.select("id, discord, username, avatar, customer_id")
			.eq("id", user.id)
			.single()

		console.log(`⚡ Profile took ${(performance.now() - start).toFixed(2)} ms to check!`)
		if (err) return null
		return data
	}

	event.locals.getRoles = async () => {
		if (!user) return null
		const start = performance.now()
		const { data, error: err } = await event.locals.supabaseServer
			.schema("profiles")
			.from("roles")
			.select("banned, premium, vip, tester, scripter, moderator, administrator")
			.eq("id", user.id)
			.single()

		console.log(`⛑️ Roles took ${(performance.now() - start).toFixed(2)} ms to check!`)
		if (err) return null
		return data
	}

	event.locals.getSubscriptions = async () => {
		if (!user) return null
		const start = performance.now()
		const { data, error: err } = await event.locals.supabaseServer
			.schema("profiles")
			.from("subscription")
			.select("subscription, product, price, date_start, date_end, cancel, disabled")
			.eq("id", user.id)

		console.log(`└──💰 Subscriptions took ${(performance.now() - start).toFixed(2)} ms to check!`)
		if (err) return null
		return data
	}

	event.locals.getFreeAccess = async () => {
		if (!user) return null
		const start = performance.now()
		const { data, error: err } = await event.locals.supabaseServer
			.schema("profiles")
			.from("free_access")
			.select("id, product, date_start, date_end")
			.eq("id", user.id)

		console.log(`└──💰 Free access took ${(performance.now() - start).toFixed(2)} ms to check!`)
		if (err) return null
		return data
	}

	if (!event.locals.session && event.url.pathname.startsWith("/dashboard")) {
		return redirect(303, "/auth")
	}

	const response = resolve(event)
	console.log(`└🤖 Auth took ${(performance.now() - start).toFixed(2)} ms to check!`)

	return response
}

const performanceCheck: Handle = async ({ event, resolve }) => {
	const start = performance.now()
	const { url } = event
	const response = await resolve(event)
	const loadTime = performance.now() - start
	console.log(`└🚀 ${url} took ${loadTime.toFixed(2)} ms to load!`)
	return response
}

export const handle: Handle = sequence(redirects, supabase, authGuard, performanceCheck)
