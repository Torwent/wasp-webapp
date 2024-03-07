import { error, redirect } from "@sveltejs/kit"

export const load = async ({ url: { origin }, locals: { supabaseServer, getSession } }) => {
	const session = await getSession()
	if (!session) {
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

	return
}
