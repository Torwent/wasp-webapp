import { browser } from "$app/environment"
import { addToolTips, getCheckBoxes } from "$lib/backend/data"
import type { Script } from "$lib/backend/types"
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
	if (search === "") {
		return await supabase
			.from("scripts_public")
			.select(
				`id, title, description, content, categories, subcategories, published, min_xp, max_xp, min_gp, max_gp,
      				scripts_protected (author, assets_path, author_id, assets_alt, revision),
	  				stats_scripts (experience, gold, runtime, levels, total_unique_users, total_current_users, total_monthly_users)`,
				{
					count: "exact"
				}
			)
			.contains("categories", categories)
			.contains("subcategories", subcategories)
			.order("title", { ascending: ascending })
			.range(start, finish)
	}

	return await supabase
		.from("scripts_public")
		.select(
			`id, title, description, content, categories, subcategories, published, min_xp, max_xp, min_gp, max_gp,
      				scripts_protected (author, assets_path, author_id, assets_alt, revision),
	  				stats_scripts (experience, gold, runtime, levels, total_unique_users, total_current_users, total_monthly_users)`,
			{ count: "exact" }
		)
		.contains("categories", categories)
		.contains("subcategories", subcategories)
		.ilike("search_script", "%" + search + "%")
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
		console.error("SELECT scripts_public failed: ", error.message)
		throw redirect(303, "/scripts")
	}

	const scripts = data as unknown as Script[]

	await new Promise<void>((resolve) => {
		scripts.forEach(async (script, index, array) => {
			await addToolTips(script, categories, subcategories)

			if (index === array.length - 1) resolve()
		})
	})

	if (!browser && scripts.length === 1)
		throw redirect(
			303,
			"/scripts/" + encodeSEO(scripts[0].title + " by " + scripts[0].scripts_protected.author)
		)

	return {
		scripts,
		checkboxes: getCheckBoxes(categories, subcategories),
		count,
		range
	}
}
