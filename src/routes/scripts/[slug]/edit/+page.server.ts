import { superValidate, setError } from "sveltekit-superforms/server"
import { fail, redirect } from "@sveltejs/kit"
import { scriptSchema } from "$lib/backend/schemas"
import { canEdit, getScriptUUID } from "$lib/backend/data"
import { filesEditSchema } from "$lib/backend/schemas.server"
import {
	createStripePriceEx,
	createStripeScriptProduct,
	updateStripePriceEx,
	updateScript
} from "$lib/backend/data.server"
import { encodeSEO } from "$lib/utils"
import type { Interval, Price } from "$lib/types/collection"

export const load = async (event) => {
	return { form: await superValidate(event, scriptSchema) }
}

interface FormFiles {
	cover?: File
	banner?: File
	script?: File
}

export const actions = {
	default: async ({ request, locals: { supabaseServer, getProfile } }) => {
		const promises = await Promise.all([getProfile(), request.formData()])

		const profile = promises[0]
		const data = promises[1]

		const files: FormFiles = { cover: undefined, banner: undefined, script: undefined }

		const coverFile = data.get("cover") as File
		const bannerFile = data.get("banner") as File
		const scriptFile = data.get("script") as File

		if (coverFile.size > 0) files.cover = coverFile
		if (bannerFile.size > 0) files.banner = bannerFile
		if (scriptFile.size > 0) files.script = scriptFile

		data.delete("cover")
		data.delete("banner")
		data.delete("script")

		const form = await superValidate(data, scriptSchema)

		if (!profile) {
			const msg = "You need to login to edit a script."
			console.error(msg)
			return setError(form, "", msg)
		}

		if (!form.valid) return fail(400, { form })

		const script = form.data.id ? await getScriptUUID(supabaseServer, form.data.id) : null
		if (!script) {
			const msg = "That script does not exist!"
			console.error(msg)
			return setError(form, "", msg)
		}

		if (script.categories.includes("Official") && !profile.roles.administrator) {
			const msg = "You cannot edit an official script!"
			console.error(msg)
			return setError(form, "", msg)
		}

		if (!canEdit(profile, script.protected.author_id)) {
			const msg = "That script does not belong to you!"
			console.error(msg)
			return setError(form, "", msg)
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
		script.published = data.has("published")

		let validFiles
		try {
			validFiles = await filesEditSchema.safeParseAsync(files)
		} catch (error) {
			console.error(error)
			return setError(form, "", "The files your sent are not valid!")
		}

		if (!validFiles.success) return fail(400, { form })

		const { error } = await updateScript(
			supabaseServer,
			script,
			validFiles.data.script,
			validFiles.data.cover,
			validFiles.data.banner
		)

		if (error) {
			console.error(error)
			return setError(form, "", error)
		}

		throw redirect(303, "/scripts/" + encodeSEO(script.title + " by " + script.protected.username))
	}
}
