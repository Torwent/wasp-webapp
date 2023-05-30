import { redirect, type Load } from "@sveltejs/kit"

export const load: Load = async ({ params, data, parent }) => {
	const { slug } = params
	if (!slug) throw redirect(300, "/scripts")

	const { script, categories, subcategories } = await parent()
	if (!script) throw redirect(300, "/scripts")

	if (!data) throw redirect(300, "/scripts/" + slug)
	const { form } = data

	return { script, form, categories, subcategories }
}
