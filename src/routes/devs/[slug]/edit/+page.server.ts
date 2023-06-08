import type { PageServerLoad } from "./$types"
import { setError, superValidate } from "sveltekit-superforms/server"
import { fail, redirect } from "@sveltejs/kit"
import { developerSchema } from "$lib/backend/types"
import { PUBLIC_SUPER_USER_ID } from "$env/static/public"
import { canEdit } from "$lib/backend/data"

export const load: PageServerLoad = async (event) => {
	const form = superValidate(event, developerSchema)
	return { form }
}

export const actions = {
	default: async ({ request, locals }) => {
		const promises = await Promise.all([locals.getProfile(), request.formData()])
		const profile = promises[0]
		const formData = promises[1]

		const form = await superValidate(formData, developerSchema)

		if (!profile) {
			const msg = "You need to login to edit a developer."
			console.error(msg)
			return setError(form, null, msg)
		}

		if (canEdit(profile, form.data.id)) {
			const msg = "You can't edit another developer profile."
			console.error(msg)
			return setError(form, null, msg)
		}

		if (!form.valid) return fail(400, { form })

		const { error } = await locals.supabase.from("devs").update(form.data).eq("id", form.data.id)

		if (error) {
			console.error(error)
			return setError(form, null, error.message)
		}

		throw redirect(303, "./")
	}
}
