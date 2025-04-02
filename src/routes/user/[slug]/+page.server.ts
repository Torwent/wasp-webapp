import { profileSchema } from "$lib/client/schemas"
import { doLogin } from "$lib/server/supabase.server"
import { formatError } from "$lib/utils.js"
import { zod } from "sveltekit-superforms/adapters"
import { setError, superValidate } from "sveltekit-superforms/server"

export const load = async ({ locals: { supabaseServer, user }, url: { origin } }) => {
	if (!user)
		return await doLogin(supabaseServer, origin, new URLSearchParams("login&provider=discord"))

	return {
		form: await superValidate({ email: user?.email }, zod(profileSchema))
	}
}

export const actions = {
	default: async ({ request, locals: { user, supabaseServer } }) => {
		const form = await superValidate(request, zod(profileSchema))

		if (!user) return setError(form, "", "You need to login to add a script.")
		if (!form.valid) return setError(form, "", "Form is not valid!")

		if (form.data.email == "") form.data.email = undefined
		if (form.data.password == "") form.data.password = undefined

		const { error: err } = await supabaseServer.auth.updateUser(form.data, {
			emailRedirectTo: "https://waspscripts.com/auth/mail-change/"
		})
		if (err) return setError(form, "", formatError(err))

		return { form, email: form.data.email != null, password: form.data.password != null }
	}
}
