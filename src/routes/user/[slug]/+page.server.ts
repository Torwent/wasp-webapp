import { profileSchema } from "$lib/backend/schemas"
import { fail } from "@sveltejs/kit"
import { setError, superValidate } from "sveltekit-superforms/server"

export const load = async (event) => {
	let address: string = ""
	try {
		address = event.getClientAddress()
	} catch (error) {
		console.error(error)
	}
	return { form: await superValidate(event, profileSchema), address }
}

export const actions = {
	default: async ({ request, locals: { getProfile, supabaseServer } }) => {
		const profile = await getProfile()

		const formData = await request.formData()

		const mailEdit = formData.get("email") !== ""
		const passEdit = formData.get("password") !== ""

		if (!mailEdit) formData.delete("email")
		if (!passEdit) formData.delete("password")

		const form = await superValidate(formData, profileSchema)

		if (!profile) {
			const msg = "You need to login to add a script."
			return setError(form, "", msg)
		}

		if (!form.valid) return fail(400, { form })

		const { error } = await supabaseServer.auth.updateUser(form.data)
		if (error) return setError(form, "", error.message)

		return { form, email: mailEdit, password: passEdit }
	}
}
