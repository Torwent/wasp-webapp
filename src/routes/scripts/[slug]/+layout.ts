import { getScript, getScriptUUID } from "$lib/backend/data"
import { UUID_V4_REGEX } from "$lib/utils"
import { error, redirect } from "@sveltejs/kit"

export const load = async ({ params, parent }) => {
	const { supabaseClient, categories, subcategories } = await parent()
	let { slug } = params

	const isUUID = UUID_V4_REGEX.test(slug)
	const isSEOFormated = slug.includes("-by-")

	if (!isUUID && !isSEOFormated) {
		slug = slug.split("&").pop() || ""
		const isOldFormat = UUID_V4_REGEX.test(slug)

		if (!isOldFormat) throw error(404, "Script not found!")
		throw redirect(301, "/scripts/" + slug)
	}

	return {
		script: isUUID ? getScriptUUID(supabaseClient, slug) : getScript(supabaseClient, slug),
		categories,
		subcategories
	}
}
