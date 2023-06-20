import { superValidate, setError } from "sveltekit-superforms/server"
import { fail, redirect } from "@sveltejs/kit"
import { scriptSchema, type ScriptPublic, type Script } from "$lib/backend/types"
import { filesSchema } from "$lib/backend/types.server"
import { uploadScript } from "$lib/backend/data.server"
import { encodeSEO } from "$lib/utils"
import { getScript } from "$lib/backend/data"
import { updateProfileRoles } from "$lib/backend/auth.server.js"
import type { SupabaseClient } from "@supabase/supabase-js"

export const load = async (event) => {
	const form = superValidate(event, scriptSchema)
	return { form }
}

async function getScripts(supabase: SupabaseClient) {
	const { data } = await supabase.from("scripts_public").select(
		`id, title, description, content, categories, subcategories, published, min_xp, max_xp, min_gp, max_gp,
      				scripts_protected (author, assets_path, author_id, assets_alt, revision),
	  				stats_scripts (experience, gold, runtime, levels, total_unique_users, total_current_users, total_monthly_users)`
	)
	return data as unknown as Script[]
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

		const url = encodeSEO(form.data.title + " by " + profile.username)

		const tmp = await getScript(locals.supabaseServer, url)
		if (tmp) {
			const msg = "A script with that name by you already exists! Choose a different name."
			console.error(msg)
			return setError(form, null, msg)
		}

		let validFiles
		try {
			validFiles = await filesSchema.safeParseAsync(files)
		} catch (error) {
			console.error(error)
			return setError(form, null, "The files your sent are not valid!")
		}

		if (!validFiles.success) return fail(400, { form })

		const script: ScriptPublic = {
			title: form.data.title,
			description: form.data.description,
			content: form.data.content,
			categories: form.data.categories,
			subcategories: form.data.subcategories,
			published: false,
			min_xp: form.data.min_xp,
			max_xp: form.data.max_xp,
			min_gp: form.data.min_gp,
			max_gp: form.data.max_gp
		}

		const { error } = await uploadScript(
			locals.supabaseServer,
			script,
			validFiles.data.script,
			validFiles.data.cover,
			validFiles.data.banner
		)

		if (error) {
			console.error(error)
			return setError(form, null, error)
		}

		profile.profiles_protected.scripter = true
		updateProfileRoles(profile)

		throw redirect(303, "./" + url)
	}
}
