import { superValidate, setError } from "sveltekit-superforms/server"
import { fail, redirect } from "@sveltejs/kit"
import { scriptSchema } from "$lib/backend/types"
import { canEdit, getScriptUUID } from "$lib/backend/data"
import { filesEditSchema } from "$lib/backend/types.server"
import { updateScript } from "$lib/backend/data.server"

export const load = async (event) => {
	const form = superValidate(event, scriptSchema)
	return { form }
}

interface FormFiles {
	cover?: File
	banner?: File
	script?: File
}

export const actions = {
	default: async ({ request, locals }) => {
		const profile = await locals.getProfile()
		const formData = await request.formData()

		let files: FormFiles = { cover: undefined, banner: undefined, script: undefined }

		const coverFile = formData.get("cover") as File
		const bannerFile = formData.get("banner") as File
		const scriptFile = formData.get("script") as File

		if (coverFile.size > 0) files.cover = coverFile
		if (bannerFile.size > 0) files.banner = bannerFile
		if (scriptFile.size > 0) files.script = scriptFile

		formData.delete("cover")
		formData.delete("banner")
		formData.delete("script")

		const form = await superValidate(formData, scriptSchema)

		if (!profile) {
			const msg = "You need to login to edit a script."
			console.error(msg)
			return setError(form, null, msg)
		}

		if (!form.valid) return fail(400, { form })

		let script = await getScriptUUID(form.data.id)
		if (!script) {
			const msg = "That script does not exist!"
			console.error(msg)
			return setError(form, null, msg)
		}

		if (script.categories.includes("Official") && !profile.profiles_protected.administrator) {
			const msg = "You cannot edit an official script!"
			console.error(msg)
			return setError(form, null, msg)
		}

		if (!canEdit(profile, script.scripts_protected.author_id)) {
			const msg = "That script does not belong to you!"
			console.error(msg)
			return setError(form, null, msg)
		}

		script.title = form.data.title
		script.description = form.data.description
		script.content = form.data.content
		script.categories = form.data.categories
		script.subcategories = form.data.subcategories
		script.min_xp = form.data.min_xp
		script.max_xp = form.data.max_xp
		script.min_gp = form.data.min_gp
		script.max_gp = form.data.max_gp
		script.published = formData.has("published")

		let validFiles
		try {
			validFiles = await filesEditSchema.safeParseAsync(files)
		} catch (error) {
			console.error(error)
			return setError(form, null, "The files your sent are not valid!")
		}

		if (!validFiles.success) return fail(400, { form })

		const { error } = await updateScript(
			locals.supabase,
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
