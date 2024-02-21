import { error, redirect, type Handle } from "@sveltejs/kit"
import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from "$env/static/public"
import { createServerClient } from "@supabase/ssr"
import type { Profile } from "$lib/types/collection"
import { profileQuery } from "$lib/utils"

export const handle: Handle = async ({ event, resolve }) => {
	const start = performance.now()

	const { url, locals } = event

	if (url.pathname === "/clear-cookies") {
		console.log("Clearing cookies...")
		event.cookies.getAll().forEach((cookie) => {
			event.cookies.delete(cookie.name, { path: "/" })
		})
		throw redirect(303, "/")
	}

	locals.supabaseServer = createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
		cookies: {
			get: (key) => event.cookies.get(key),
			set: (key, value, options) => {
				event.cookies.set(key, value, options)
			},
			remove: (key, options) => {
				event.cookies.delete(key, options)
			}
		}
	})

	locals.getSession = async () => {
		const {
			data: { session }
		} = await locals.supabaseServer.auth.getSession()
		return session
	}

	locals.getUser = async () => {
		const {
			data: { user }
		} = await locals.supabaseServer.auth.getUser()
		return user
	}

	locals.getProfile = async () => {
		const user = await locals.getUser()
		if (!user) return null

		const id = user.id
		const { data, error: err } = await locals.supabaseServer
			.schema("profiles")
			.from("profiles")
			.select(profileQuery)
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

	if (response.status === 509) {
		throw redirect(303, "/clear-cookies")
	}

	return response
}
