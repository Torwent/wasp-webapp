import { doLogin } from "$lib/backend/data.server"
import { API_URL } from "$lib/utils"
import { error, fail } from "@sveltejs/kit"

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

	refresh: async ({ fetch, locals: { getProfile } }) => {
		const profile = await getProfile()
		if (!profile) return { success: false, message: "You are not logged in!" }

		if (profile.profiles_protected.subscription_external)
			await fetch(API_URL + "/discord/refresh/" + profile.discord_id, {
				method: "GET"
			}).catch((error) => console.error(error))
		else
			await fetch(API_URL + "/discord/update/" + profile.discord_id, {
				method: "GET"
			}).catch((error) => console.error(error))

		return { success: true }
	}
}
