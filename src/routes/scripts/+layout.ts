import type { Category, SubCategory } from "$lib/types/collection"
import { error } from "@sveltejs/kit"
import { get, writable } from "svelte/store"

const categoriesStore = writable<Category[] | null>(null)
const subcategoriesStore = writable<SubCategory[] | null>(null)

export const load = async ({ parent }) => {
	async function getCategories() {
		let result = get(categoriesStore)
		if (!result) {
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
			result = data
			categoriesStore.set(result)
		}
		return result
	}

	async function getSubCategories() {
		let result = get(subcategoriesStore)
		if (!result) {
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
			result = data
			subcategoriesStore.set(result)
		}
		return result
	}

	return {
		categories: getCategories(),
		subcategories: getSubCategories()
	}
}
