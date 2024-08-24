import { superValidate, setError } from "sveltekit-superforms/server"
import { redirect } from "@sveltejs/kit"
import { addScriptServerSchema } from "$lib/server/schemas.server"
import { doLogin, uploadScript } from "$lib/server/supabase.server"
import { encodeSEO, scriptDefaultContent } from "$lib/utils"
import { scriptExists } from "$lib/client/supabase"
import { zod } from "sveltekit-superforms/adapters"

export const load = async ({ locals: { supabaseServer, user, session }, url: { origin } }) => {
	if (!user || !session) {
		return await doLogin(supabaseServer, origin, new URLSearchParams("login&provider=discord"))
	}

	const form = await superValidate(zod(addScriptServerSchema))
	form.data.content = scriptDefaultContent
	return { form }
}

export const actions = {
	default: async ({ request, locals: { user, session, supabaseServer, getProfile } }) => {
		if (!user || !session) {
			return await doLogin(supabaseServer, origin, new URLSearchParams("login&provider=discord"))
		}

		const promises = await Promise.all([
			getProfile(),
			superValidate(request, zod(addScriptServerSchema))
		])
		const profile = promises[0]
		const form = promises[1]

		if (profile?.id !== user.id)
			return setError(form, "", "You can't add a script for another user.")

		if (!form.valid) {
			console.error("Form is not valid " + JSON.stringify(form.errors))
			return setError(
				form,
				"",
				"Form is not valid \n" +
					JSON.stringify(form.errors) +
					"\n" +
					JSON.stringify(form.data) +
					"\n" +
					JSON.stringify(await request.formData())
			)
		}

		const tmp = await scriptExists(
			supabaseServer,
			encodeSEO(form.data.title + " by " + profile.username)
		)
		if (tmp) {
			const msg = "A script with that name by you already exists! Choose a different name."
			console.error(msg)
			return setError(form, "", msg)
		}

		const { url, error: err } = await uploadScript(supabaseServer, form.data)

		if (err) return setError(form, "", err)
		if (url) throw redirect(303, "/scripts/" + url)
		throw redirect(303, "/scripts")
	}
}
