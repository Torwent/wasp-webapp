import { setError, superValidate } from "sveltekit-superforms/server"
import { zod } from "sveltekit-superforms/adapters"
import { redirect } from "@sveltejs/kit"
import { scripterSchema } from "$lib/client/schemas"
import { canEdit } from "$lib/client/supabase"
import { formatError } from "$lib/utils.js"

export const load = async () => {
	return { form: await superValidate(zod(scripterSchema)) }
}

export const actions = {
	default: async ({ request, locals: { supabaseServer, session, getProfile, getRoles } }) => {
		const promises = await Promise.all([
			getProfile(),
			getRoles(),
			superValidate(request, zod(scripterSchema))
		])
		const profile = promises[0]
		const roles = promises[1]
		const form = promises[2]

		if (!form.valid) return setError(form, "", "Form is not valid.")
		if (!session || !profile) {
			const msg = "You need to login to edit a scripter."
			console.error(msg)
			return setError(form, "", msg)
		}

		if (!canEdit(profile.id, roles, form.data.id)) {
			const msg = "You can't edit another scripter profile."
			console.error(msg)
			return setError(form, "", msg)
		}

		const { error: err } = await supabaseServer
			.schema("profiles")
			.from("scripters")
			.update({
				content: form.data.content,
				description: form.data.description,
				github: form.data.github,
				paypal_id: form.data.paypal_id,
				realname: form.data.realname
			})
			.eq("id", form.data.id)

		if (err) return setError(form, "", formatError(err))

		redirect(303, "./")
	}
}
