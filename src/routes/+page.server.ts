import type { Provider } from "@supabase/supabase-js"
import { fail, redirect } from "@sveltejs/kit"

export const actions = {
	login: async ({ locals: { supabase }, url }) => {
		const provider = url.searchParams.get("provider") as Provider

		if (provider) {
			const { data, error: err } = await supabase.auth.signInWithOAuth({
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
	},

	logout: async ({ locals: { supabase } }) => {
		const { error: err } = await supabase.auth.signOut()
		if (err) {
			console.error("Logout failed: " + err)
			return fail(400, { message: "Something went wrong logging you out!" })
		}

		return { success: true }
	}
}
