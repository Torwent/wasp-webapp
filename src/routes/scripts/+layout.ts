import type { Category, SubCategory } from "$lib/types/collection.js"
import type { SupabaseClient } from "@supabase/supabase-js"
import { redirect } from "@sveltejs/kit"

async function getCategories(supabase: SupabaseClient) {
	const { data, error } = await supabase
		.from("scripts_categories")
		.select("name, emoji")
		.returns<Category[]>()
	if (error) {
		console.error("SELECT scripts_categories failed: " + error.message)
		throw redirect(303, "/")
	}
	return data
}

async function getSubCategories(supabase: SupabaseClient) {
	const { data, error } = await supabase
		.from("scripts_subcategories")
		.select("category, name, emoji")
		.returns<SubCategory[]>()
	if (error) {
		console.error("SELECT scripts_categories failed: " + error.message)
		throw redirect(303, "/")
	}
	return data
}

export const load = async ({ parent }) => {
	const { supabaseClient } = await parent()

	return {
		categories: getCategories(supabaseClient),
		subcategories: getSubCategories(supabaseClient)
	}
}
