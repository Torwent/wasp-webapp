import { browser } from "$app/environment"
import type { CheckboxType, Script } from "$lib/types/collection"
import { error, redirect } from "@sveltejs/kit"
import { get, writable } from "svelte/store"
const checkboxesStore = writable<CheckboxType[] | null>(null)

export const load = async ({ url, parent }) => {
	const pageN = Number(url.searchParams.get("page") || "-1")
	const page = pageN < 0 || Number.isNaN(pageN) ? 1 : pageN

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
		const { supabaseClient } = await parent()

		let query = supabaseClient
			.schema("scripts")
			.from("scripts")
			.select(
				`id, url, title, description, content, categories, subcategories, published, min_xp, max_xp, min_gp, max_gp,
				tooltip_emojis, tooltip_names,
				protected (assets, author_id, revision, username, avatar),
				stats_simba (experience, gold, runtime, levels, unique_users_total, online_users_total)`,
				{ count: "estimated" }
			)
			.eq("published", true)
			.limit(1, { foreignTable: "protected" })
			.limit(1, { foreignTable: "stats_simba" })
			.contains("categories", categoriesFilter)
			.contains("subcategories", subcategoriesFilter)

		if (search === "") {
			query = query.order("title", { ascending: ascending }).range(start, finish)
		} else {
			query = query.ilike("search", "%" + search.replaceAll(" ", "%") + "%")
		}

		const { data, error: err, count } = await query.returns<Script[]>()

		if (err)
			throw error(
				500,
				`Server error, this is probably not an issue on your end! - SELECT scripts failed
			Error code: ${err.code}
			Error hint: ${err.hint}
			Error details: ${err.details}
			Error hint: ${err.message}`
			)

		if (!browser && data.length === 1) throw redirect(303, "/scripts/" + data[0].url)

		return { data, count: count ?? 0 }
	}

	async function getFeatured() {
		const { supabaseClient } = await parent()

		const { data, error: err } = await supabaseClient
			.schema("scripts")
			.from("featured")
			.select(
				`scripts (url, title, description, tooltip_emojis, protected (assets, username, avatar))`
			)

		if (err) {
			throw error(
				500,
				`Server error, this is probably not an issue on your end! - SELECT scripts failed
			Error code: ${err.code}
			Error hint: ${err.hint}
			Error details: ${err.details}
			Error hint: ${err.message}`
			)
		}

		return data.map((scripts) => scripts.scripts)
	}

	async function getCheckBoxes() {
		let result = get(checkboxesStore)
		if (!result) {
			result = []
			let id = 0
			const { categories, subcategories } = await parent()
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
			checkboxesStore.set(result)
		}

		return result
	}

	const promises = await Promise.all([
		getScripts(search, ascending, start, finish),
		getCheckBoxes(),
		getFeatured()
	])

	return {
		scripts: promises[0],
		checkboxes: promises[1],
		featured: promises[2],
		range
	}
}
