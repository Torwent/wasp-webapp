import { setError, superValidate } from "sveltekit-superforms/server"
import { fail, redirect } from "@sveltejs/kit"
import { postSchema } from "$lib/backend/schemas"
import { encodeSEO } from "$lib/utils"
import type { TutorialWithAuthor } from "$lib/types/collection"

export const load = async (event) => {
	const form = superValidate(event, postSchema)
	return { form }
}

export const actions = {
	default: async ({ request, locals: { supabaseServer } }) => {
		const formData = await request.formData()
		const form = await superValidate(formData, postSchema)

		if (!form.valid || form.data.id === null || form.data.id === undefined)
			return fail(400, { form })

		const { data, error } = await supabaseServer
			.from("tutorials")
			.update(form.data)
			.eq("id", form.data.id)
			.select()
			.returns<TutorialWithAuthor[]>()

		if (error) {
			console.error("tutorials UPDATE failed: " + error.message)
			return setError(form, null, error.message)
		}

		throw redirect(
			303,
			"/tutorials/" + encodeSEO(data[0].title + " by " + data[0].profiles_public.username)
		)
	}
}
