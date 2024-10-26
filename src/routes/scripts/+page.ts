import { browser } from "$app/environment"
import { streamedErrorHandler } from "$lib/client/utils"
import type { ScriptBase, ScriptFeatured } from "$lib/types/collection"
import { formatError } from "$lib/utils"
import { error, redirect } from "@sveltejs/kit"

export const load = async ({ url, parent, depends }) => {
	depends("supabase:scripts")
	const pageN = Number(url.searchParams.get("page") || "-1")
	const page = pageN < 0 || Number.isNaN(pageN) ? 1 : pageN

	const amountN = Number(url.searchParams.get("amount") || "12")
	const amount = amountN < 0 || Number.isNaN(amountN) ? 1 : amountN

	const search = decodeURIComponent(url.searchParams.get("search") || "").trim()
	const ascending = url.searchParams.get("ascending")?.toLowerCase() !== "true"
	const categoriesStr = decodeURIComponent(url.searchParams.get("categories") || "")
	const categoriesFilter = categoriesStr.split("-")

	const subcategoriesStr = decodeURIComponent(url.searchParams.get("subcategories") || "")
	const subcategoriesFilter = subcategoriesStr.split("-")

	const start = (page - 1) * amount
	const finish = start + amount - 1

	async function getScripts(search: string, ascending: boolean, start: number, finish: number) {
		const { supabaseClient } = await parent()

		let query = supabaseClient
			.schema("scripts")
			.from("scripts")
			.select(
				`title, description, url, published, tooltip_emojis, tooltip_names, protected!inner (assets, username, avatar)`,
				{ count: "estimated" }
			)
			.eq("published", true)
			.contains("categories", categoriesFilter)
			.contains("subcategories", subcategoriesFilter)

		if (search === "") {
			query = query.order("title", { ascending: ascending }).range(start, finish)
		} else {
			query = query.ilike("search", "%" + search.replaceAll(" ", "%") + "%")
		}

		const { data, error: err, count } = await query.returns<ScriptBase[]>()

		if (err) {
			error(
				500,
				"Server error, this is probably not an issue on your end!" +
					"SELECT scripts failed!\n\n" +
					formatError(err)
			)
		}

		if (!browser && data.length === 1) redirect(303, "/scripts/" + data[0].url)

		return { scripts: data, count: count ?? 0 }
	}

	async function getFeatured() {
		const { supabaseClient } = await parent()
		const { data, error: err } = await supabaseClient
			.schema("scripts")
			.from("featured")
			.select(
				"scripts (url, title, description, tooltip_emojis, protected (assets, username, avatar))"
			)
			.returns<ScriptFeatured[]>()

		if (err) {
			error(
				500,
				"Server error, this is probably not an issue on your end!\n" +
					"SELECT scripts.featured failed!\n\n" +
					formatError(err)
			)
		}

		return await Promise.all(data.map(async (scripts) => scripts.scripts))
	}

	async function getCheckBoxes() {
		const checkboxes = []
		let id = 0
		const { categoriesPromise, subcategoriesPromise } = await parent()

		const categories = await categoriesPromise

		for (const category of categories) {
			checkboxes.push({
				id: id++,
				name: category.name,
				emoji: category.emoji,
				main: true,
				checked: false
			})

			const subcategories = await subcategoriesPromise

			for (const subcategory of subcategories) {
				if (category.name === subcategory.category) {
					checkboxes.push({
						id: id++,
						name: subcategory.name,
						emoji: subcategory.emoji,
						main: false,
						checked: false
					})
				}
			}
		}

		return checkboxes
	}

	const promises = await Promise.all([
		getScripts(search, ascending, start, finish),
		getFeatured(),
		getCheckBoxes()
	])
	return { scripts: promises[0], featured: promises[1], checkboxes: promises[2], amount }
}
