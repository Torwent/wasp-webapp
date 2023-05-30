import type { PageServerLoad } from "./$types"
import { superValidate, setError } from "sveltekit-superforms/server"
import { fail, redirect } from "@sveltejs/kit"
import { scriptSchema } from "$lib/backend/types"
import { getScriptUUID } from "$lib/backend/data"
import { filesEditSchema } from "$lib/backend/types.server"
import { updateScript } from "$lib/backend/data.server"

export const load: PageServerLoad = async (event) => {
	const form = superValidate(event, scriptSchema)
	return { form }
}

export const actions = {
	default: async ({ request, locals }) => {
		const profile = await locals.getProfile()
		const formData = await request.formData()

		const files = {
			cover: formData.get("cover"),
			banner: formData.get("banner"),
			script: formData.get("script")
		}

		formData.delete("cover")
		formData.delete("banner")
		formData.delete("script")

		const form = await superValidate(formData, scriptSchema)

		if (!profile) {
			const msg = "You need to login to add a script."
			console.error(msg)
			return setError(form, null, msg)
		}

		if (!form.valid) return fail(400, { form })

		const script = await getScriptUUID(form.data.id)
		if (!script) {
			const msg = "That script does not exist!"
			console.error(msg)
			return setError(form, null, msg)
		}

		if (script.scripts_protected.author_id !== profile.id) {
			const msg = "That script does not belong to you!"
			console.error(msg)
			return setError(form, null, msg)
		}

		let validFiles
		try {
			validFiles = await filesEditSchema.safeParseAsync(files)
		} catch (error) {
			console.error(error)
			return setError(form, null, "The files your sent are not valid!")
		}

		if (!validFiles.success) return fail(400, { form })

		const { error } = await updateScript(
			script,
			validFiles.data.script,
			validFiles.data.cover,
			validFiles.data.banner
		)

		if (error) {
			console.error(error)
			return setError(form, null, error)
		}

		throw redirect(303, "./")
	}
}
