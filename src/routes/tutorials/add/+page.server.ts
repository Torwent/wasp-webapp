import { setError, superValidate } from "sveltekit-superforms/server"
import { zod } from "sveltekit-superforms/adapters"
import { fail, redirect } from "@sveltejs/kit"
import { postSchema } from "$lib/client/schemas"
import { formatError } from "$lib/utils.js"

export const load = async () => {
	return { form: await superValidate(zod(postSchema)) }
}

export const actions = {
	default: async ({ request, locals: { supabaseServer, user, getRoles } }) => {
		if (!user) return fail(403, { message: "You need to login to add a script." })

		const promises = await Promise.all([getRoles(), superValidate(request, zod(postSchema))])
		const roles = promises[0]
		const form = promises[1]

		if (!roles?.administrator || !roles?.moderator || !roles?.scripter)
			return setError(form, "", "Only administrators can add new versions of a the legal documents")
		if (!form.valid) return setError(form, "", "Form is not valid!")

		const { data } = await supabaseServer
			.schema("info")
			.from("tutorials")
			.select("*")
			.eq("title", form.data.title)
			.eq("author_id", user.id)
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
				author_id: user.id
			})
			.select()
			.single()

		if (err) return setError(form, "", formatError(err))

		redirect(303, "./" + tutorial.url)
	}
}
