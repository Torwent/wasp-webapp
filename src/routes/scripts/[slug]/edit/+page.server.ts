import { superValidate, setError } from "sveltekit-superforms/server"
import { redirect } from "@sveltejs/kit"
import { updateScriptServerSchema } from "$lib/server/schemas.server"
import { canEdit, getScript } from "$lib/client/supabase"
import { doLogin, updateScript } from "$lib/server/supabase.server"
import { UUID_V4_REGEX } from "$lib/utils"
import { zod } from "sveltekit-superforms/adapters"

export const load = async ({ locals: { supabaseServer, user, session }, parent }) => {
	if (!user || !session) {
		return await doLogin(supabaseServer, origin, new URLSearchParams("login&provider=discord"))
	}

	const { script } = await parent()

	return {
		form: await superValidate(
			{
				title: script.title,
				description: script.description,
				categories: script.metadata.categories,
				content: script.content,
				xp_min: script.stats_limits.xp_min,
				xp_max: script.stats_limits.xp_max,
				gp_min: script.stats_limits.gp_min,
				gp_max: script.stats_limits.gp_max,
				published: script.published
			},
			zod(updateScriptServerSchema),
			{ allowFiles: true }
		)
	}
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
			superValidate(request, zod(updateScriptServerSchema), { allowFiles: true })
		])

		const roles = promises[0]
		const form = promises[1]

		if (!roles) {
			return await doLogin(supabaseServer, origin, new URLSearchParams("login&provider=discord"))
		}

		if (!form.valid) {
			console.error("Form is not valid " + JSON.stringify(form.errors))
			return setError(form, "", "Form is not valid \n" + JSON.stringify(form.errors))
		}

		const isUUID = UUID_V4_REGEX.test(slug)
		const script = await getScript(supabaseServer, slug, isUUID)

		if (script.metadata.status === "official" && !roles.administrator) {
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
