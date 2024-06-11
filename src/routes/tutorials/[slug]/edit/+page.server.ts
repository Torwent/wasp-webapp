import { setError, superValidate } from "sveltekit-superforms/server"
import { fail, redirect } from "@sveltejs/kit"
import { postSchema } from "$lib/client/schemas"
import type { Tutorial } from "$lib/types/collection"
import { zod } from "sveltekit-superforms/adapters"
import { formatError } from "$lib/utils.js"

export const load = async () => {
	return { form: await superValidate(zod(postSchema)) }
}

export const actions = {
	default: async ({ request, locals: { supabaseServer, getProfile }, params }) => {
		const { slug } = params
		const promises = await Promise.all([getProfile, superValidate(request, zod(postSchema))])
		const form = promises[1]

		if (!form.valid) return setError(form, "", "Form is not valid!")

		const { data, error: err } = await supabaseServer
			.schema("info")
			.from("tutorials")
			.update(form.data)
			.eq("url", slug)
			.select()
			.single()

		if (err) return setError(form, "", formatError(err))
		redirect(303, "/tutorials/" + data.url)
	}
}
