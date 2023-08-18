import { superValidate, setError } from "sveltekit-superforms/server"
import { fail, redirect } from "@sveltejs/kit"
import { scriptSchema } from "$lib/backend/schemas"
import { filesSchema } from "$lib/backend/schemas.server"
import { uploadScript } from "$lib/backend/data.server"
import { encodeSEO } from "$lib/utils"
import { scriptExists } from "$lib/backend/data"
import type { ScriptBase } from "$lib/types/collection"

export const load = async (event) => {
	return { form: superValidate(event, scriptSchema) }
}

export const actions = {
	default: async ({ request, locals: { supabaseServer, getProfile } }) => {
		const promises = await Promise.all([getProfile(), request.formData()])

		const profile = promises[0]
		const formData = promises[1]

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
			return setError(form, "", msg)
		}

		if (!form.valid) return fail(400, { form })

		const url = encodeSEO(form.data.title + " by " + profile.username)

		const tmp = await scriptExists(supabaseServer, url)
		if (tmp) {
			const msg = "A script with that name by you already exists! Choose a different name."
			console.error(msg)
			return setError(form, "", msg)
		}

		let validFiles
		try {
			validFiles = await filesSchema.safeParseAsync(files)
		} catch (error) {
			console.error(error)
			return setError(form, "", "The files your sent are not valid!")
		}

		if (!validFiles.success) return fail(400, { form })

		const script: ScriptBase = {
			title: form.data.title,
			description: form.data.description,
			content: form.data.content,
			categories: form.data.categories,
			subcategories: form.data.subcategories,
			published: false,
			min_xp: form.data.min_xp,
			max_xp: form.data.max_xp,
			min_gp: form.data.min_gp,
			max_gp: form.data.max_gp,
			id: "",
			fts: undefined,
			search: "",
			tooltip_emojis: [],
			tooltip_names: [],
			url: "",
			created_at: ""
		}

		const { url: script_url, error: err } = await uploadScript(
			supabaseServer,
			script,
			validFiles.data.script,
			validFiles.data.cover,
			validFiles.data.banner
		)

		if (err) {
			console.error(err)
			return setError(form, "", err)
		}

		if (script_url) throw redirect(303, "./" + script_url)
		throw redirect(303, "./" + url)
	}
}
