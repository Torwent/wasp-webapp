import { setError, superValidate } from "sveltekit-superforms/server"
import { fail, redirect } from "@sveltejs/kit"
import { scripterSchema } from "$lib/backend/schemas"
import { canEdit } from "$lib/backend/data"

export const load = async (event) => {
	return { form: await superValidate(event, scripterSchema) }
}

export const actions = {
	default: async ({ request, locals: { supabaseServer, getProfile } }) => {
		const setup = await Promise.all([getProfile(), request.formData()])
		const profile = setup[0]

		const form = await superValidate(setup[1], scripterSchema)

		if (!profile) {
			const msg = "You need to login to edit a scripter."
			console.error(msg)
			return setError(form, "", msg)
		}

		if (!canEdit(profile, form.data.id)) {
			const msg = "You can't edit another scripter profile."
			console.error(msg)
			return setError(form, "", msg)
		}

		if (!form.valid) return fail(400, { form })

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

		if (err) {
			console.error(err)
			return setError(form, "", err.message)
		}

		redirect(303, "./")
	}
}
