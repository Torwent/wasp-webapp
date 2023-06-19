import type { Category, SubCategory } from "$lib/backend/types"
import type { SupabaseClient } from "@supabase/supabase-js"

async function getCategories(supabase: SupabaseClient) {
	const { data } = await supabase.from("scripts_categories").select("name, emoji")
	return data as Category[]
}

async function getSubCategories(supabase: SupabaseClient) {
	const { data } = await supabase.from("scripts_subcategories").select("category, name, emoji")
	return data as SubCategory[]
}

export const load = async ({ parent }) => {
	const { supabaseClient } = await parent()

	return {
		categories: getCategories(supabaseClient),
		subcategories: getSubCategories(supabaseClient)
	}
}
