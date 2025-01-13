import { loginAsSchema } from "$lib/client/schemas"
import { doLogin } from "$lib/server/supabase.server"
import { formatError } from "$lib/utils"
import { error, redirect } from "@sveltejs/kit"
import { zod } from "sveltekit-superforms/adapters"
import { setError, superValidate } from "sveltekit-superforms/server"

export const load = async ({ locals: { user, getRoles } }) => {
	if (!user) error(403, "You need to be logged in to access this page.")
	const roles = await getRoles()
	if (!roles?.administrator) error(403, "You need to be an admin to access this page.")

	return { form: await superValidate(zod(loginAsSchema)) }
}

export const actions = {
	login: async ({ locals: { supabaseServer }, url: { origin, searchParams } }) => {
		return await doLogin(supabaseServer, origin, searchParams)
	},

	loginas: async ({ request, locals: { user, getRoles, supabaseServer } }) => {
		if (!user) error(403, "You need to be logged in to access this page.")

		const promises = await Promise.all([getRoles(), superValidate(request, zod(loginAsSchema))])

		const roles = promises[0]
		const form = promises[1]

		if (!roles?.administrator) error(403, "You need to be an admin to access this page.")
		if (!form.valid) return setError(form, "", "Form is not valid \n" + JSON.stringify(form.errors))

		const { data, error: err } = await supabaseServer.auth.refreshSession(form.data)

		if (err) return setError(form, "", "Form is not valid \n" + JSON.stringify(err))

		console.log("Successfully logged in as: ", data.user?.id ?? "null")
		redirect(303, "/")
	},

	logout: async ({ locals: { supabaseServer } }) => {
		const { error: err } = await supabaseServer.auth.signOut()
		if (err) error(400, formatError(err))
		return { success: true }
	},

	refresh: async ({ locals: { user } }) => {
		if (!user) return { success: false, message: "You are not logged in!" }
		return { success: true }
	}
}
