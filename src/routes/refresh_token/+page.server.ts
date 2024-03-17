import { error, redirect } from "@sveltejs/kit"

export const load = async ({ url: { origin }, locals: { supabaseServer, getSession } }) => {
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

		if (err) {
			console.error("Login failed: " + err.message)
			throw error(400, { message: "Something went wrong logging you in!" })
		}

		throw redirect(303, data.url)
	}

	return { refresh_token: session.refresh_token }
}
