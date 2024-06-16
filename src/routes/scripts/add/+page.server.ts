import { superValidate, setError } from "sveltekit-superforms/server"
import { redirect } from "@sveltejs/kit"
import { addScriptServerSchema } from "$lib/server/schemas.server"
import { uploadScript } from "$lib/server/supabase.server"
import { encodeSEO, scriptDefaultContent } from "$lib/utils"
import { scriptExists } from "$lib/client/supabase"
import { zod } from "sveltekit-superforms/adapters"

export const load = async () => {
	const form = await superValidate(zod(addScriptServerSchema))
	form.data.content = scriptDefaultContent
	return { form }
}

export const actions = {
	default: async ({ request, locals: { supabaseServer, getProfile } }) => {
		const promises = await Promise.all([
			getProfile(),
			superValidate(request, zod(addScriptServerSchema))
		])
		const profile = promises[0]
		const form = promises[1]

		if (!profile) return setError(form, "", "You need to login to add a script.")
		if (!form.valid) return setError(form, "", "Form is not valid!")

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
		if (url) throw redirect(303, "../" + url)
		throw redirect(303, "./" + url)
	}
}
