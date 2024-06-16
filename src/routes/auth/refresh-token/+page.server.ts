import { formatError } from "$lib/utils.js"
import { error, redirect } from "@sveltejs/kit"

export const load = async ({ url: { origin }, locals: { supabaseServer } }) => {
	const { data, error: sessionError } = await supabaseServer.auth.refreshSession()
	const { session } = data
	if (sessionError || session == null) {
		const { data, error: err } = await supabaseServer.auth.signInWithOAuth({
			provider: "discord",
			options: {
				redirectTo: origin + "/api/auth/simba/",
				scopes: "identify email guilds guilds.members.read"
			}
		})

		if (err) error(400, formatError(err))
		redirect(303, data.url)
	}

	return { token: session.refresh_token }
}
