import { profileSchema } from "$lib/client/schemas"
import { doLogin } from "$lib/server/supabase.server"
import { formatError } from "$lib/utils.js"
import { zod } from "sveltekit-superforms/adapters"
import { setError, superValidate } from "sveltekit-superforms/server"

export const load = async ({ locals: { supabaseServer, session }, url: { origin } }) => {
	if (!session)
		return await doLogin(supabaseServer, origin, new URLSearchParams("login&provider=discord"))

	return { form: await superValidate(zod(profileSchema)), email: session.user.email }
}

export const actions = {
	default: async ({ request, locals: { getProfile, supabaseServer } }) => {
		const promises = await Promise.all([getProfile(), superValidate(request, zod(profileSchema))])
		const profile = promises[0]
		const form = promises[1]

		if (!profile) return setError(form, "", "You need to login to add a script.")
		if (!form.valid) return setError(form, "", "Form is not valid!")

		if (form.data.email == "") form.data.email = undefined
		if (form.data.password == "") form.data.password = undefined

		const { error: err } = await supabaseServer.auth.updateUser(form.data)
		if (err) return setError(form, "", formatError(err))

		return { form, email: form.data.email != null, password: form.data.password != null }
	}
}
