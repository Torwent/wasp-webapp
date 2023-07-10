import { doLogin } from "$lib/backend/data.server"
import { error } from "@sveltejs/kit"

export const actions = {
	default: async ({
		locals: { supabaseServer, getSession, getProfile },
		url: { origin, searchParams }
	}) => {
		const session = await getSession()
		const profile = await getProfile()

		if (!session) {
			await doLogin(supabaseServer, origin, new URLSearchParams("login&provider=discord"))
		}

		if (!profile?.profiles_protected.premium) {
			throw error(403, "You are premium already!")
		}

		const params = searchParams.get("product_id")

		return
	}
}
