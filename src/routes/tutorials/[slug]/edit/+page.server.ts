import { setError, superValidate } from "sveltekit-superforms/server"
import { fail, redirect } from "@sveltejs/kit"
import { postSchema } from "$lib/client/schemas"
import { zod } from "sveltekit-superforms/adapters"
import { formatError } from "$lib/utils.js"
import { doLogin } from "$lib/server/supabase.server"

export const load = async ({ locals: { supabaseServer, user, session } }) => {
	if (!user || !session) {
		return await doLogin(supabaseServer, origin, new URLSearchParams("login&provider=discord"))
	}
	return { form: await superValidate(zod(postSchema)) }
}

export const actions = {
	default: async ({ request, locals: { supabaseServer, user, session, getRoles }, params }) => {
		if (!user || !session) {
			return await doLogin(supabaseServer, origin, new URLSearchParams("login&provider=discord"))
		}

		const promises = await Promise.all([getRoles(), superValidate(request, zod(postSchema))])
		const roles = promises[0]
		const form = promises[1]

		const { slug } = params
		const { data: tutData, error: errData } = await supabaseServer
			.schema("info")
			.from("tutorials")
			.select("author_id")
			.eq("url", slug)
			.single()

		if (errData) return setError(form, "", formatError(errData))

		if (tutData.author_id !== user.id && (!roles?.administrator || !roles?.moderator))
			return setError(form, "", "You don't have permission to edit this tutorial")

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
