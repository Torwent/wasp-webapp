import { doLogin } from "$lib/server/supabase.server"
import { formatError } from "$lib/utils.js"
import { error } from "@sveltejs/kit"

export const load = async ({ locals: { session, getRoles } }) => {
	if (!session) error(403, "You need to be logged in to access this page.")
	const roles = await getRoles()
	if (!roles?.administrator) error(403, "You need to be an admin to access this page.")

	return
}

export const actions = {
	login: async ({ locals: { supabaseServer }, url: { origin, searchParams } }) => {
		return await doLogin(supabaseServer, origin, searchParams)
	},

	loginas: async ({ locals: { supabaseServer, session, getRoles } }) => {
		if (!session) error(403, "You need to be logged in to access this page.")
		const roles = await getRoles()
		if (!roles?.administrator) error(403, "You need to be an admin to access this page.")

		error(500, "NOT DONE YET!")
	},

	logout: async ({ locals: { supabaseServer } }) => {
		const { error: err } = await supabaseServer.auth.signOut()
		if (err) error(400, formatError(err))
		return { success: true }
	},

	refresh: async ({ locals: { session } }) => {
		if (!session) return { success: false, message: "You are not logged in!" }
		return { success: true }
	}
}
