import { supabaseClient } from "$lib/backend/auth"
import { addToolTips, getCategories, getCheckBoxes, getSubCategories } from "$lib/backend/data"
import type { Script } from "$lib/backend/types"
import { redirect, type Load } from "@sveltejs/kit"

export const load: Load = async ({ url, depends }) => {
	depends("scripts:list")

	const pageStr = url.searchParams.get("page") || "-1"
	const page = Number(pageStr) < 0 || Number.isNaN(Number(pageStr)) ? 1 : Number(pageStr)

	const search = decodeURIComponent(url.searchParams.get("search") || "").trim()
	const ascending = url.searchParams.get("ascending")?.toLowerCase() !== "true"
	const categoriesStr = decodeURIComponent(url.searchParams.get("categories") || "")
	const categoriesFilters = categoriesStr.split("-")

	const subcategoriesStr = decodeURIComponent(url.searchParams.get("subcategories") || "")
	const subcategoriesFilters = subcategoriesStr.split("-")

	const range = 11
	const start = (page - 1) * range
	const finish = start + range

	let scriptsPromise

	if (search === "") {
		scriptsPromise = supabaseClient
			.from("scripts_public")
			.select(
				`id, title, description, content, categories, subcategories, published, min_xp, max_xp, min_gp, max_gp,
      				scripts_protected (author, assets_path, author_id, assets_alt, revision),
	  				stats_scripts (experience, gold, runtime, levels, total_unique_users, total_current_users, total_monthly_users)`,
				{
					count: "exact"
				}
			)
			.contains("categories", categoriesFilters)
			.contains("subcategories", subcategoriesFilters)
			.order("title", { ascending: ascending })
			.range(start, finish)
	} else {
		scriptsPromise = supabaseClient
			.from("scripts_public")
			.select(
				`id, title, description, content, categories, subcategories, published, min_xp, max_xp, min_gp, max_gp,
      				scripts_protected (author, assets_path, author_id, assets_alt, revision),
	  				stats_scripts (experience, gold, runtime, levels, total_unique_users, total_current_users, total_monthly_users)`,
				{
					count: "exact"
				}
			)
			.contains("categories", categoriesFilters)
			.contains("subcategories", subcategoriesFilters)
			.ilike("scripts_public_search", "%" + search + "%")
	}

	const promises = await Promise.all([
		scriptsPromise,
		getCheckBoxes(),
		getCategories(),
		getSubCategories()
	])

	const { data, error, count } = promises[0]

	if (error) {
		console.error(error)
		throw redirect(303, "/")
	}

	const scriptData = data as unknown as Script[]

	await new Promise<void>((resolve) => {
		scriptData.forEach(async (script, index, array) => {
			await addToolTips(script)

			if (index === array.length - 1) resolve()
		})
	})

	const scripts = scriptData
	const checkboxes = promises[1]
	const categories = promises[2]
	const subcategories = promises[3]

	if (!checkboxes || !categories || !subcategories) throw redirect(303, "/")

	return {
		scripts,
		checkboxes,
		categories,
		subcategories,
		range,
		count
	}
}
