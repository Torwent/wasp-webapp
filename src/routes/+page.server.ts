import { invalidate } from "$app/navigation"
import { API_URL } from "$lib/utils"
import type { Provider } from "@supabase/supabase-js"
import { fail, redirect } from "@sveltejs/kit"

export const actions = {
	set_session: async ({ locals: { supabaseServer }, cookies }) => {
		const access_token = cookies.get("sveltekit-access-token")
		const refresh_token = cookies.get("sveltekit-refresh-token")
		const sveltekit_access_token = access_token === "undefined" ? undefined : access_token
		const sveltekit_refresh_token = refresh_token === "undefined" ? undefined : refresh_token

		if (sveltekit_access_token && sveltekit_refresh_token) {
			await supabaseServer.auth.setSession({
				access_token: sveltekit_access_token,
				refresh_token: sveltekit_refresh_token
			})
		} else await supabaseServer.auth.signOut()

		return
	},

	login: async ({ locals: { supabaseServer }, url }) => {
		const provider = url.searchParams.get("provider") as Provider

		if (provider) {
			const { data, error: err } = await supabaseServer.auth.signInWithOAuth({
				provider: provider,
				options: {
					redirectTo: url.origin,
					scopes: "identify email guilds guilds.members.read"
				}
			})

			if (err) {
				console.error("Login failed: " + err)
				return fail(400, { message: "Something went wrong logging you in!" })
			}

			throw redirect(303, data.url)
		}
		return
	},

	logout: async ({ locals: { supabaseServer }, cookies }) => {
		const { error: err } = await supabaseServer.auth.signOut()
		if (err) {
			console.error("Logout failed: " + err)
			return fail(400, { message: "Something went wrong logging you out!" })
		}

		cookies.delete("sveltekit-access-token")
		cookies.delete("sveltekit-refresh-token")

		cookies.delete("sb-access-token")
		cookies.delete("sb-refresh-token")
		return { success: true }
	},

	refresh: async ({ locals: { getProfile } }) => {
		const profile = await getProfile()
		if (!profile) return { success: false, message: "You are not logged in!" }

		await fetch(API_URL + "/discord/refresh/" + profile.discord_id, {
			method: "GET"
		}).catch((error) => console.error(error))

		return { success: true }
	}
}
