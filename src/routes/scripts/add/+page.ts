import { getCategories, getSubCategories } from "$lib/backend/data"
import { redirect, type Load } from "@sveltejs/kit"

export const load: Load = async ({ data, parent }) => {
	await parent()
	const promises = await Promise.all([getCategories(), getSubCategories()])
	const categories = promises[0]
	const subcategories = promises[1]

	if (!categories || !subcategories || data == null) throw redirect(303, "/")

	const { form } = data

	return { form, categories, subcategories }
}
