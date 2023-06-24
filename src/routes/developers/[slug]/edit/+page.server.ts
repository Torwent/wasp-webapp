import { setError, superValidate } from "sveltekit-superforms/server"
import { fail, redirect } from "@sveltejs/kit"
import { developerSchema } from "$lib/backend/schemas"
import { canEdit } from "$lib/backend/data"

export const load = async (event) => {
	const form = superValidate(event, developerSchema)
	return { form }
}

export const actions = {
	default: async ({ request, locals }) => {
		const { supabaseServer, getProfile } = locals

		const profile = await getProfile()
		const formData = await request.formData()

		const form = await superValidate(formData, developerSchema)

		if (!profile) {
			const msg = "You need to login to edit a developer."
			console.error(msg)
			return setError(form, null, msg)
		}

		if (!canEdit(profile, form.data.id)) {
			const msg = "You can't edit another developer profile."
			console.error(msg)
			return setError(form, null, msg)
		}

		if (!form.valid) return fail(400, { form })

		const promises = await Promise.all([
			supabaseServer
				.from("developers")
				.update({
					content: form.data.content,
					description: form.data.description,
					github: form.data.github,
					paypal_id: form.data.paypal_id,
					realname: form.data.realname
				})
				.eq("id", form.data.id),
			supabaseServer
				.from("profiles_public")
				.update({
					username: form.data.username
				})
				.eq("id", form.data.id)
		])

		if (promises[0].error) {
			console.error(promises[0].error)
			return setError(form, null, promises[0].error.message)
		}

		if (promises[1].error) {
			console.error(promises[1].error)
			return setError(form, null, promises[1].error.message)
		}

		throw redirect(303, "/developers/" + form.data.username)
	}
}
