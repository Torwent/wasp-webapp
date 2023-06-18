import { redirect } from "@sveltejs/kit"
import { getCategories, getScript, getScriptUUID, getSubCategories } from "$lib/backend/data"
import { UUID_V4_REGEX } from "$lib/utils"

export const load = async ({ params, data }) => {
	const { slug } = params

	const script = UUID_V4_REGEX.test(slug) ? await getScriptUUID(slug) : await getScript(slug)
	if (!script) throw redirect(300, "/scripts")

	const { dismissed } = data

	return { script, dismissed, categories: getCategories(), subcategories: getSubCategories() }
}
