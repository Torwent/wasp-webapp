import { setError, superValidate } from "sveltekit-superforms/server"
import { fail, redirect } from "@sveltejs/kit"
import { developerSchema } from "$lib/backend/types"
import { canEdit } from "$lib/backend/data"

export const load = async (event) => {
	const form = superValidate(event, developerSchema)
	return { form }
}

export const actions = {
	default: async ({ request, locals }) => {
		const profile = await locals.getProfile()
		const formData = await request.formData()

		const form = await superValidate(formData, developerSchema)

		if (!profile) {
			const msg = "You need to login to edit a developer."
			console.error(msg)
			return setError(form, null, msg)
		}

		if (canEdit(profile, form.data.id)) {
			const msg = "You can't edit another developer profile."
			console.error(msg)
			return setError(form, null, msg)
		}

		if (!form.valid) return fail(400, { form })

		const { error } = await locals.supabaseServer
			.from("developers")
			.update(form.data)
			.eq("id", form.data.id)

		if (error) {
			console.error(error)
			return setError(form, null, error.message)
		}

		throw redirect(303, "./")
	}
}
