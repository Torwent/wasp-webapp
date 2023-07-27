import { setError, superValidate } from "sveltekit-superforms/server"
import { fail, redirect } from "@sveltejs/kit"
import { postSchema } from "$lib/backend/schemas"
import type { TutorialWithAuthor } from "$lib/types/collection"

export const load = async (event) => {
	return { form: superValidate(event, postSchema) }
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
			.eq("user_id", profile.id)
			.returns<TutorialWithAuthor[]>()

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
				url: ""
			})
			.select()
			.returns<TutorialWithAuthor[]>()

		if (err) {
			console.error("tutorials INSERT failed: " + err.message)
			return setError(form, "", err.message)
		}

		throw redirect(303, "./" + tutorial[0].url)
	}
}
