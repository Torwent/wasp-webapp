import type { Category, SubCategory } from "$lib/types/collection"
import type { SupabaseClient } from "@supabase/supabase-js"
import { error } from "@sveltejs/kit"

async function getCategories(supabase: SupabaseClient) {
	const { data, error: err } = await supabase
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
		Error hint: ${err.message}
		`
		)
	return data
}

async function getSubCategories(supabase: SupabaseClient) {
	const { data, error: err } = await supabase
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
		Error hint: ${err.message}
		`
		)
	return data
}

export const load = async ({ parent }) => {
	const { supabaseClient } = await parent()

	return {
		categories: getCategories(supabaseClient),
		subcategories: getSubCategories(supabaseClient)
	}
}
