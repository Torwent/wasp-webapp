import type { PageServerLoad } from "./$types"
import { setError, superValidate } from "sveltekit-superforms/server"
import { fail, redirect } from "@sveltejs/kit"
import { postSchema } from "$lib/backend/types"
import { encodeSEO } from "$lib/utils"
import { getPost } from "$lib/backend/data"

export const load: PageServerLoad = async (event) => {
	const form = superValidate(event, postSchema)
	return { form }
}

export const actions = {
	default: async ({ request, locals }) => {
		const formData = await request.formData()
		const form = await superValidate(formData, postSchema)

		if (!form.valid) return fail(400, { form })

		const profile = await locals.getProfile()

		if (!profile) {
			const msg = "You need to login to add a script."
			console.error(msg)
			return setError(form, null, msg)
		}

		const url = encodeSEO(form.data.title + " by " + profile.username)

		if (await getPost(url)) {
			const msg = "A post with that name by you already exists! Choose a different title."
			console.error(msg)
			return setError(form, null, msg)
		}

		const { error } = await locals.supabase.from("tutorials").insert(form.data)

		if (error) {
			console.error("tutorials INSERT failed: " + error)
			return setError(form, null, error.message)
		}

		throw redirect(303, "./" + url)
	}
}
