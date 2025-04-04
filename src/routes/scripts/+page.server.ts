import { getPublishedScripts, searchScriptsIndex } from "$lib/server/scripts.server"
import { formatError } from "$lib/utils"
import { error } from "@sveltejs/kit"

export async function load({ depends, url, locals: { supabaseServer } }) {
	depends("wasp:scripts")
	const pageN = Number(url.searchParams.get("page") || "-1")
	const page = pageN < 0 || Number.isNaN(pageN) ? 1 : pageN

	const amountN = Number(url.searchParams.get("amount") || "12")
	const amount = amountN < 0 || Number.isNaN(amountN) ? 1 : amountN

	const search = decodeURIComponent(url.searchParams.get("search") || "").trim()

	const statusFilter = url.searchParams.get("status")
	const typeFilter = url.searchParams.get("type")

	const categoriesStr = url.searchParams.get("categories")
	const categoriesFilter = categoriesStr ? decodeURIComponent(categoriesStr).split("-") : null
	const categoriesSet = new Set(categoriesFilter)

	const start = (page - 1) * amount
	const finish = start + amount - 1

	const allScripts = getPublishedScripts()
	let scripts = await (search !== "" ? searchScriptsIndex(search) : allScripts)

	async function getFeatured() {
		const { data, error: err } = await supabaseServer
			.schema("scripts")
			.from("featured")
			.select("id")

		if (err) {
			error(
				500,
				"Server error, this is probably not an issue on your end!\n" +
					"SELECT scripts.featured failed!\n\n" +
					formatError(err)
			)
		}
		const scripts = await allScripts
		return scripts.filter((script) => data.some((scrpt) => script.id === scrpt.id))
	}

	if (statusFilter) scripts = scripts.filter((script) => script.metadata.status === statusFilter)
	if (typeFilter) scripts = scripts.filter((script) => script.metadata.type === typeFilter)

	if (categoriesFilter) {
		scripts = scripts.filter((script) =>
			script.metadata.categories.some((category) => categoriesSet.has(category))
		)
	}

	const filteredScripts = scripts.slice(Math.max(0, start), Math.min(scripts.length, finish + 1))

	return { scripts: filteredScripts, featured: await getFeatured(), amount, count: scripts.length }
}
