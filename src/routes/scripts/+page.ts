import { browser } from "$app/environment"
import type { CheckboxType, Script } from "$lib/types/collection"
import { error, redirect } from "@sveltejs/kit"

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

	async function getScripts(search: string, ascending: boolean, start: number, finish: number) {
		const { supabaseClient } = await parentPromise

		let query = supabaseClient
			.from("scripts_public")
			.select(
				`id, url, title, description, content, categories, subcategories, published, min_xp, max_xp, min_gp, max_gp,
			tooltip_emojis, tooltip_names,
			scripts_protected (assets_path, author_id, assets_alt, revision, profiles_public (username, avatar_url)),
			stats_scripts (experience, gold, runtime, levels, total_unique_users, total_current_users, total_monthly_users)`,
				{ count: "exact" }
			)
			.eq("published", true)
			.contains("categories", categoriesFilter)
			.contains("subcategories", subcategoriesFilter)

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

	async function getCheckBoxes() {
		const { categories, subcategories } = await parentPromise

		const result: CheckboxType[] = []
		let id = 0

		for (const category of categories) {
			result.push({
				id: id++,
				name: category.name,
				emoji: category.emoji,
				main: true,
				checked: false
			})

			for (const subcategory of subcategories) {
				if (category.name === subcategory.category) {
					result.push({
						id: id++,
						name: subcategory.name,
						emoji: subcategory.emoji,
						main: false,
						checked: false
					})
				}
			}
		}

		return result
	}

	return {
		scripts: getScripts(search, ascending, start, finish),
		checkboxes: getCheckBoxes(),
		range
	}
}
