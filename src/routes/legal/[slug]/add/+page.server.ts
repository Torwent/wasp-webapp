import { setError, superValidate } from "sveltekit-superforms/server"
import { fail, redirect } from "@sveltejs/kit"
import { legalSchema } from "$lib/client/schemas"
import { zod } from "sveltekit-superforms/adapters"
import { formatError } from "$lib/utils"

export const load = async ({ parent }) => {
	const { policies } = await parent()
	return {
		form: await superValidate({ content: policies[0].originalContent }, zod(legalSchema))
	}
}

export const actions = {
	default: async ({ request, locals: { supabaseServer, user, getRoles }, params }) => {
		if (!user) return fail(403, { message: "You need to login to add a new legal document." })

		const promises = await Promise.all([getRoles(), superValidate(request, zod(legalSchema))])
		const roles = promises[0]
		const form = promises[1]

		if (!roles?.administrator)
			return setError(form, "", "Only administrators can add new versions of a the legal documents")

		if (!form.valid) return setError(form, "", "Form is not valid!")

		const slug = params.slug as "privacy_policy" | "scripter_tos" | "user_tos"
		const { error: err } = await supabaseServer.schema("info").from(slug).insert(form.data)

		if (err) return setError(form, "", formatError(err))
		console.log(slug)
		redirect(303, "/legal/" + slug)
	}
}
