import { browser } from "$app/environment"
import { addToolTips, getCheckBoxes } from "$lib/backend/data"
import type { Script } from "$lib/types/collection"
import { encodeSEO } from "$lib/utils"
import type { SupabaseClient } from "@supabase/supabase-js"
import { redirect } from "@sveltejs/kit"

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
			`id, title, description, content, categories, subcategories, published, min_xp, max_xp, min_gp, max_gp,
			scripts_protected (assets_path, author_id, assets_alt, revision, profiles_public (username)),
			stats_scripts (experience, gold, runtime, levels, total_unique_users, total_current_users, total_monthly_users)`,
			{ count: "exact" }
		)
		.eq("published", true)
		.contains("categories", categories)
		.contains("subcategories", subcategories)

	if (search === "") {
		query = query.order("title", { ascending: ascending }).range(start, finish)
	} else {
		query = query.ilike("search_script", "%" + search + "%")
	}

	return await query.returns<Script[]>()
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

	const { data, error, count } = await getScripts(
		supabaseClient,
		search,
		categoriesFilter,
		subcategoriesFilter,
		ascending,
		start,
		finish
	)
	if (error) {
		console.error("SELECT scripts_public failed: " + error.message)
		throw redirect(303, "/scripts")
	}

	await new Promise<void>((resolve) => {
		data.forEach(async (script, index, array) => {
			await addToolTips(script, categories, subcategories)

			if (index === array.length - 1) resolve()
		})
	})

	if (!browser && data.length === 1)
		throw redirect(
			303,
			"/scripts/" +
				encodeSEO(data[0].title + " by " + data[0].scripts_protected.profiles_public.username)
		)

	return {
		scripts: data,
		checkboxes: getCheckBoxes(categories, subcategories),
		count,
		range
	}
}
