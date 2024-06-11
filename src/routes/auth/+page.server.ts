import { formatError } from "$lib/utils.js"
import type { Provider } from "@supabase/supabase-js"
import { error, fail, redirect } from "@sveltejs/kit"

export const actions = {
	login: async ({ locals: { supabaseServer }, url: { origin, searchParams } }) => {
		const provider = searchParams.get("provider") as Provider
		if (!provider) error(403, "Failed to login! Provider not specified!")

		const { data, error: err } = await supabaseServer.auth.signInWithOAuth({
			provider: provider,
			options: {
				redirectTo: origin + "/api/auth/callback/",
				scopes: "identify email guilds guilds.members.read"
			}
		})

		if (err) error(400, formatError(err))
		redirect(303, data.url)
	},

	logout: async ({ locals: { supabaseServer } }) => {
		const { error } = await supabaseServer.auth.signOut()
		if (error) {
			console.error("Logout failed: " + error.message)
			return fail(400, { message: "Something went wrong logging you out!" })
		}

		return { success: true }
	},

	refresh: async ({ locals: { session } }) => {
		if (!session) return { success: false, message: "You are not logged in!" }
		return { success: true }
	}
}
