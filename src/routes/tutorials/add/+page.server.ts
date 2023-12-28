import { setError, superValidate } from "sveltekit-superforms/server"
import { fail, redirect } from "@sveltejs/kit"
import { postSchema } from "$lib/backend/schemas"
import type { Tutorial } from "$lib/types/collection"

export const load = async (event) => {
	return { form: await superValidate(event, postSchema) }
}

export const actions = {
	default: async ({ request, locals: { getProfile, supabaseServer } }) => {
		const promises = await Promise.all([getProfile(), request.formData()])
		const profile = promises[0]

		const dataForm = promises[1]

		const form = await superValidate(dataForm, postSchema)

		if (!form.valid) return fail(400, { form })

		if (!profile) {
			const msg = "You need to login to add a script."
			console.error(msg)
			return setError(form, "", msg)
		}

		const { data } = await supabaseServer
			.from("tutorials")
			.select("*")
			.eq("title", form.data.title)
			.eq("author_id", profile.id)
			.returns<Tutorial[]>()

		if (data && data.length > 0) {
			const msg = "A post with that name by you already exists! Choose a different title."
			console.error(msg)
			return setError(form, "", msg)
		}

		const { data: tutorial, error: err } = await supabaseServer
			.from("tutorials")
			.insert({
				title: form.data.title,
				description: form.data.description,
				content: form.data.content,
				level: form.data.level,
				order: form.data.order,
				published: dataForm.has("published"),
				search: "",
				url: "",
				author_id: profile.id
			})
			.select()
			.returns<Tutorial[]>()

		if (err) {
			console.log("tutorials INSERT failed: ")
			console.error(err)
			return setError(form, "", err.message)
		}

		throw redirect(303, "./" + tutorial[0].url)
	}
}
