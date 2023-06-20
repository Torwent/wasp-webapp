import type { Category, SubCategory } from "$lib/backend/types"
import type { SupabaseClient } from "@supabase/supabase-js"

async function getCategories(supabase: SupabaseClient) {
	const { data, error } = await supabase.from("scripts_categories").select("name, emoji")
	if (error) console.error("SELECT scripts_categories failed: " + error.message)
	return data as unknown as Category[]
}

async function getSubCategories(supabase: SupabaseClient) {
	const { data, error } = await supabase
		.from("scripts_subcategories")
		.select("category, name, emoji")
	if (error) console.error("SELECT scripts_categories failed: " + error.message)
	return data as unknown as SubCategory[]
}

export const load = async ({ parent }) => {
	const { supabaseClient } = await parent()

	return {
		categories: getCategories(supabaseClient),
		subcategories: getSubCategories(supabaseClient)
	}
}
