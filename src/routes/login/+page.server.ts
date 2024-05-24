import { doLogin } from "$lib/backend/data.server"
import { redirect } from "@sveltejs/kit"

export const load = async ({ url: { origin }, locals: { supabaseServer } }) => {
	const { data, error: sessionError } = await supabaseServer.auth.refreshSession()
	const { session } = data
	if (sessionError || session == null) {
		await doLogin(supabaseServer, origin, new URLSearchParams("login&provider=discord"))
	}

	throw redirect(303, "/")
}
