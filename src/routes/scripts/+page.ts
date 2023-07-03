import { browser } from "$app/environment"
import { getCheckBoxes } from "$lib/backend/data"
import type { Script } from "$lib/types/collection"
import type { SupabaseClient } from "@supabase/supabase-js"
import { error, redirect } from "@sveltejs/kit"

async function getScripts(
	supabase: SupabaseClient,
	search: string,
	categories: string[],
	subcategories: string[],
	ascending: boolean,
	start: number,
	finish: number
) {
	let query = supabase
		.from("scripts_public")
		.select(
			`id, url, title, description, content, categories, subcategories, published, min_xp, max_xp, min_gp, max_gp,
			tooltip_emojis, tooltip_names,
			scripts_protected (assets_path, author_id, assets_alt, revision, profiles_public (username, avatar_url)),
			stats_scripts (experience, gold, runtime, levels, total_unique_users, total_current_users, total_monthly_users)`,
			{ count: "exact" }
		)
		.eq("published", true)
		.contains("categories", categories)
		.contains("subcategories", subcategories)

	if (search === "") {
		query = query.order("title", { ascending: ascending }).range(start, finish)
	} else {
		query = query.ilike("search", "%" + search + "%")
	}

	const { data, error: err, count } = await query.returns<Script[]>()

	if (err)
		throw error(
			500,
			`Server error, this is probably not an issure on your end! - SELECT scripts failed
			Error code: ${err.code}
			Error hint: ${err.hint}
			Error details: ${err.details}
			Error hint: ${err.message}`
		)

	if (!browser && data.length === 1) throw redirect(303, "/scripts/" + data[0].url)

	return { data, count }
}

export const load = async ({ url, parent, depends }) => {
	const parentPromise = parent()
	depends("supabase:scripts")

	const pageStr = url.searchParams.get("page") || "-1"
	const page = Number(pageStr) < 0 || Number.isNaN(Number(pageStr)) ? 1 : Number(pageStr)

	const search = decodeURIComponent(url.searchParams.get("search") || "").trim()
	const ascending = url.searchParams.get("ascending")?.toLowerCase() !== "true"
	const categoriesStr = decodeURIComponent(url.searchParams.get("categories") || "")
	const categoriesFilter = categoriesStr.split("-")

	const subcategoriesStr = decodeURIComponent(url.searchParams.get("subcategories") || "")
	const subcategoriesFilter = subcategoriesStr.split("-")

	const range = 11
	const start = (page - 1) * range
	const finish = start + range

	const { supabaseClient, categories, subcategories } = await parentPromise

	return {
		scripts: getScripts(
			supabaseClient,
			search,
			categoriesFilter,
			subcategoriesFilter,
			ascending,
			start,
			finish
		),
		checkboxes: getCheckBoxes(categories, subcategories),
		range
	}
}
