import { setError, superValidate } from "sveltekit-superforms/server"
import { zod } from "sveltekit-superforms/adapters"
import { redirect } from "@sveltejs/kit"
import { postSchema } from "$lib/client/schemas"
import { formatError } from "$lib/utils.js"

export const load = async () => {
	return { form: await superValidate(zod(postSchema)) }
}

export const actions = {
	default: async ({ request, locals: { user, getProfile, supabaseServer } }) => {
		const promises = await Promise.all([getProfile(), superValidate(request, zod(postSchema))])
		const profile = promises[0]
		const form = promises[1]

		if (!form.valid) return setError(form, "", "Form is not valid.")
		if (!user || !profile) {
			const msg = "You need to login to add a script."
			console.error(msg)
			return setError(form, "", msg)
		}

		const { data } = await supabaseServer
			.schema("info")
			.from("tutorials")
			.select("*")
			.eq("title", form.data.title)
			.eq("author_id", profile.id)
			.single()

		if (data) {
			const msg = "A post with that name by you already exists! Choose a different title."
			console.error(msg)
			return setError(form, "", msg)
		}

		const { data: tutorial, error: err } = await supabaseServer
			.schema("info")
			.from("tutorials")
			.insert({
				title: form.data.title,
				description: form.data.description,
				content: form.data.content,
				level: form.data.level,
				order: form.data.order,
				published: form.data.published,
				author_id: profile.id
			})
			.select()
			.single()

		if (err) return setError(form, "", formatError(err))

		redirect(303, "./" + tutorial.url)
	}
}
