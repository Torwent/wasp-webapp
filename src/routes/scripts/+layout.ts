import type { Category, SubCategory } from "$lib/types/collection"
import { error } from "@sveltejs/kit"

export const load = async ({ parent }) => {
	const { supabaseClient } = await parent()

	async function getCategories() {
		const { data, error: err } = await supabaseClient
			.schema("scripts")
			.from("categories")
			.select("name, emoji")
			.returns<Category[]>()

		if (err) {
			throw error(
				500,
				`Server error, this is probably not an issue on your end! - SELECT scripts.categories failed
					Error code: ${err.code}
					Error hint: ${err.hint}
					Error details: ${err.details}
					Error hint: ${err.message}`
			)
		}

		return data
	}

	async function getSubCategories() {
		const { data, error: err } = await supabaseClient
			.schema("scripts")
			.from("subcategories")
			.select("category, name, emoji")
			.returns<SubCategory[]>()

		if (err) {
			throw error(
				500,
				`Server error, this is probably not an issue on your end! - SELECT scripts.subcategories failed
			Error code: ${err.code}
			Error hint: ${err.hint}
			Error details: ${err.details}
			Error hint: ${err.message}`
			)
		}

		return data
	}

	const promises = await Promise.all([getCategories(), getSubCategories()])

	return { categories: promises[0], subcategories: promises[1] }
}
