import { addToolTips, getCategories, getCheckBoxes, getSubCategories } from "$lib/backend/data"
import type { IScriptCard, Script } from "$lib/backend/types"
import { redirect, type Load } from "@sveltejs/kit"

export const load: Load = async ({ url, depends, parent }) => {
	depends("scripts:list")

	const { supabase } = await parent()

	const pageStr = url.searchParams.get("page") || "-1"
	const page = Number(pageStr) < 0 || Number.isNaN(Number(pageStr)) ? 1 : Number(pageStr)

	const search = decodeURI(url.searchParams.get("search") || "")
	const ascending = url.searchParams.get("ascending")?.toLowerCase() !== "true"
	const categoriesStr = decodeURI(url.searchParams.get("categories") || "")
	const categoriesFilters = categoriesStr.split("-")

	const subcategoriesStr = decodeURI(url.searchParams.get("subcategories") || "")
	const subcategoriesFilters = subcategoriesStr.split("-")

	const range = 11
	const start = (page - 1) * range
	const finish = start + range

	let scriptsPromise

	if (search === "") {
		scriptsPromise = supabase
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
		scriptsPromise = supabase
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
			.textSearch("scripts_public_search", search, { type: "websearch" })
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

	const scriptData = data as Script[]

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
