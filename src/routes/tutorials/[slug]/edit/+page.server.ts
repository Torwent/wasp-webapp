import { setError, superValidate } from "sveltekit-superforms/server"
import { fail, redirect } from "@sveltejs/kit"
import { postSchema } from "$lib/backend/types"

export const load = async (event) => {
	const form = superValidate(event, postSchema)
	return { form }
}

export const actions = {
	default: async ({ request, locals }) => {
		const formData = await request.formData()
		const form = await superValidate(formData, postSchema)

		if (!form.valid || !form.data.id) return fail(400, { form })

		const { error } = await locals.supabaseServer
			.from("tutorials")
			.update(form.data)
			.eq("id", form.data.id)

		if (error) {
			console.error("tutorials UPDATE failed: " + error.message)
			return setError(form, null, error.message)
		}

		throw redirect(303, "./")
	}
}
