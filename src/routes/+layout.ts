import { createBrowserClient, createServerClient, isBrowser } from "@supabase/ssr"
import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from "$env/static/public"
import type { Database } from "$lib/types/supabase"

export const load = async ({ data, depends, fetch }) => {
	depends("supabase:auth")

	const supabaseClient = isBrowser()
		? createBrowserClient<Database>(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
				global: { fetch }
			})
		: createServerClient<Database>(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
				global: { fetch },
				cookies: {
					getAll() {
						return data.cookies
					}
				}
			})

	const {
		data: { session }
	} = await supabaseClient.auth.getSession()

	const {
		data: { user }
	} = await supabaseClient.auth.getUser()

	const getProfile = async () => {
		if (!user) return null
		const { data, error: err } = await supabaseClient
			.schema("profiles")
			.from("profiles")
			.select(`id, discord, username, avatar, customer_id`)
			.eq("id", user.id)
			.single()

		if (err) return null

		return data
	}

	const getRoles = async () => {
		if (!user) return null
		const { data, error: err } = await supabaseClient
			.schema("profiles")
			.from("roles")
			.select("banned, premium, vip, tester, scripter, moderator, administrator")
			.eq("id", user.id)
			.single()

		if (err) return null

		return data
	}

	const promises = await Promise.all([getProfile(), getRoles()])

	return {
		darkMode: data.darkMode,
		theme: data.theme,
		supabaseClient,
		session,
		user,
		profile: promises[0],
		roles: promises[1]
	}
}
