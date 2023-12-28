import { setError, superValidate } from "sveltekit-superforms/server"
import { fail, redirect } from "@sveltejs/kit"
import { postSchema } from "$lib/backend/schemas"
import type { Tutorial } from "$lib/types/collection"

export const load = async (event) => {
	return { form: await superValidate(event, postSchema) }
}

export const actions = {
	default: async ({ request, locals: { supabaseServer } }) => {
		const dataForm = await request.formData()
		const form = await superValidate(dataForm, postSchema)

		if (!form.valid) return fail(400, { form })

		const formUpdateData = {
			title: form.data.title,
			description: form.data.description,
			content: form.data.content,
			level: form.data.level,
			order: form.data.order,
			published: dataForm.has("published")
		}

		const { data, error } = await supabaseServer
			.from("tutorials")
			.update(formUpdateData)
			.eq("id", form.data.id)
			.select()
			.returns<Tutorial[]>()

		if (error) {
			console.error("tutorials UPDATE failed: " + error.message)
			return setError(form, "", error.message)
		}

		throw redirect(303, "/tutorials/" + data[0].url)
	}
}
