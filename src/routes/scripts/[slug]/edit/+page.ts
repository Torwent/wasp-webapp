import { redirect } from "@sveltejs/kit"
import { getCategories, getScript, getSubCategories } from "$lib/backend/data"

export const load = async ({ params, data }) => {
	const { slug } = params
	if (!slug) throw redirect(300, "/scripts")

	const script = await getScript(slug)
	if (!script) throw redirect(300, "/scripts")

	if (!data) throw redirect(300, "/scripts/" + slug)
	const { form } = data

	return { script, form, categories: getCategories(), subcategories: getSubCategories() }
}
