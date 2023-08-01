import { doLogin } from "$lib/backend/data.server"
import { fail } from "@sveltejs/kit"

export const actions = {
	login: async ({ locals: { supabaseServer }, url: { origin, searchParams } }) => {
		await doLogin(supabaseServer, origin, searchParams)
	},

	logout: async ({ locals: { supabaseServer } }) => {
		const { error } = await supabaseServer.auth.signOut()
		if (error) {
			console.error("Logout failed: " + error.message)
			return fail(400, { message: "Something went wrong logging you out!" })
		}

		return { success: true }
	},

	refresh: async ({ locals: { getProfile } }) => {
		const profile = await getProfile()
		if (!profile) return { success: false, message: "You are not logged in!" }
		return { success: true }
	}
}
