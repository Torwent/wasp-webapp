import { superValidate, setError } from "sveltekit-superforms/server"
import { redirect } from "@sveltejs/kit"
import { updateScriptServerSchema } from "$lib/server/schemas.server"
import { canEdit, getScript } from "$lib/client/supabase"
import { doLogin, updateScript } from "$lib/server/supabase.server"
import { UUID_V4_REGEX } from "$lib/utils"
import { zod } from "sveltekit-superforms/adapters"

export const load = async ({ locals: { supabaseServer, user, session } }) => {
	if (!user || !session) {
		return await doLogin(supabaseServer, origin, new URLSearchParams("login&provider=discord"))
	}
	return { form: await superValidate(zod(updateScriptServerSchema)) }
}

export const actions = {
	default: async ({
		request,
		params: { slug },
		locals: { supabaseServer, user, session, getRoles }
	}) => {
		if (!user || !session) {
			return await doLogin(supabaseServer, origin, new URLSearchParams("login&provider=discord"))
		}

		const promises = await Promise.all([
			getRoles(),
			superValidate(request, zod(updateScriptServerSchema))
		])
		const roles = promises[0]
		const form = promises[1]

		if (!form.valid) {
			return setError(
				form,
				"",
				"Form is not valid" + (form.errors?._errors ? ": " + form.errors?._errors.toString() : "!")
			)
		}

		const isUUID = UUID_V4_REGEX.test(slug)
		const script = await getScript(supabaseServer, slug, isUUID)

		if (script.categories.includes("Official") && !roles?.administrator) {
			return setError(form, "", "You cannot edit an official script!")
		}

		if (!canEdit(user.id, roles, script.protected.author_id)) {
			return setError(form, "", "You can't edit a script that doesn't belong to you!")
		}

		const { url, error: err } = await updateScript(
			supabaseServer,
			script.id,
			form.data,
			script.protected.revision
		)

		if (err) return setError(form, "", err)

		redirect(303, "/scripts/" + url)
	}
}
