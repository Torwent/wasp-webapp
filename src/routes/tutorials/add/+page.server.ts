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
	default: async ({ request, locals }) => {
		const formData = await request.formData()
		const form = await superValidate(formData, postSchema)

		if (!form.valid) return fail(400, { form })

		const { getProfile, supabaseServer } = locals

		const profile = await getProfile()

		if (!profile) {
			const msg = "You need to login to add a script."
			console.error(msg)
			return setError(form, null, msg)
		}

		const { data } = await supabaseServer
			.from("tutorials")
			.select("id, created_at, user_id, author, title, description, content, level")
			.eq("title", form.data.title)
			.eq("user_id", profile.id)
			.returns<TutorialWithAuthor[]>()

		if (data && data.length > 0) {
			const msg = "A post with that name by you already exists! Choose a different title."
			console.error(msg)
			return setError(form, null, msg)
		}

		const { data: tutorial, error } = await supabaseServer
			.from("tutorials")
			.insert(form.data)
			.returns<TutorialWithAuthor[]>()

		if (error) {
			console.error("tutorials INSERT failed: " + error.message)
			return setError(form, null, error.message)
		}

		const url = encodeSEO(tutorial[0].title + " by " + profile.username)
		throw redirect(303, "./" + url)
	}
}
