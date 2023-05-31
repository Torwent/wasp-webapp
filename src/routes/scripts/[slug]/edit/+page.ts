import { redirect } from "@sveltejs/kit"
import type { PageLoad } from "./$types"
import { getCategories, getScript, getSubCategories } from "$lib/backend/data"

export const load: PageLoad = async ({ params, data, parent }) => {
	const { slug } = params
	if (!slug) throw redirect(300, "/scripts")

	await parent()
	const script = await getScript(slug)
	if (!script) throw redirect(300, "/scripts")

	if (!data) throw redirect(300, "/scripts/" + slug)
	const { form } = data

	return { script, form, categories: getCategories(), subcategories: getSubCategories() }
}
