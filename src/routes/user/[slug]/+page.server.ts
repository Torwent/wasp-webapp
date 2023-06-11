import { profileSchema } from "$lib/backend/types"
import { fail, type ServerLoad } from "@sveltejs/kit"
import { setError, superValidate } from "sveltekit-superforms/server"

export const load: ServerLoad = async (event) => {
	const form = superValidate(event, profileSchema)
	return { form, address: event.getClientAddress() }
}

export const actions = {
	default: async ({ request, locals }) => {
		const profile = await locals.getProfile()
		const formData = await request.formData()

		if (formData.get("email") == "") formData.delete("email")
		if (formData.get("password") == "") formData.delete("password")

		const form = await superValidate(formData, profileSchema)

		if (!profile) {
			const msg = "You need to login to add a script."
			console.error(msg)
			return setError(form, null, msg)
		}

		if (!form.valid) return fail(400, { form })

		const { error } = await locals.supabase.auth.updateUser(form.data)
		if (error) {
			console.error("User data UPDATE failed: " + error)
			return setError(form, null, error.message)
		}

		return { form }
	}
}
