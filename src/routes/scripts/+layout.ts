import type { Category, SubCategory } from "$lib/types/collection"
import { error } from "@sveltejs/kit"

export const load = async ({ parent }) => {
	async function getCategories() {
		const { supabaseClient } = await parent()
		const { data, error: err } = await supabaseClient
			.from("scripts_categories")
			.select("name, emoji")
			.returns<Category[]>()
		if (err)
			throw error(
				500,
				`Server error, this is probably not an issure on your end! - SELECT scripts_categories failed
			Error code: ${err.code}
			Error hint: ${err.hint}
			Error details: ${err.details}
			Error hint: ${err.message}`
			)
		return data
	}

	async function getSubCategories() {
		const { supabaseClient } = await parent()
		const { data, error: err } = await supabaseClient
			.from("scripts_subcategories")
			.select("category, name, emoji")
			.returns<SubCategory[]>()
		if (err)
			throw error(
				500,
				`Server error, this is probably not an issure on your end! - SELECT scripts_subcategories failed
			Error code: ${err.code}
			Error hint: ${err.hint}
			Error details: ${err.details}
			Error hint: ${err.message}`
			)
		return data
	}

	return {
		categories: getCategories(),
		subcategories: getSubCategories()
	}
}
