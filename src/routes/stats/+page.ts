import { getStatsTotal } from "$lib/backend/data"
import type { Stats } from "$lib/types/collection"
import { UUID_V4_REGEX } from "$lib/utils"
import { error } from "@sveltejs/kit"

export const load = async ({ url, depends, parent }) => {
	depends("supabase:stats")

	const order = url.searchParams.get("order") || "experience"
	const ascending = url.searchParams.get("ascending")?.toLowerCase() === "true"
	const search = decodeURIComponent(url.searchParams.get("search") || "").trim()

	const pageN = Number(url.searchParams.get("page") || "-1")
	const page = pageN < 0 || Number.isNaN(pageN) ? 1 : pageN

	const range = 20
	const start = (page - 1) * range
	const finish = start + range

	const totalEntries = 10

	const { supabaseClient } = await parent()

	async function getStats() {
		const query = supabaseClient
			.from("stats")
			.select("username, experience, gold, levels, runtime", { count: "exact" })

		if (search === "") {
			query
				.or("experience.gt.0,gold.gt.0")
				.range(start, finish)
				.order(order, { ascending: ascending, nullsFirst: false })
		} else if (UUID_V4_REGEX.test(search)) {
			query.eq("id", search)
		} else {
			query.ilike("username", "%" + search.replaceAll("%", "") + "%")
		}

		const { data, count, error: err } = await query

		if (err)
			throw error(
				500,
				`Server error, this is probably not an issue on your end! - SELECT stats failed
			Error code: ${err.code}
			Error hint: ${err.hint}
			Error details: ${err.details}
			Error hint: ${err.message}`
			)

		return { stats: data, count: count || totalEntries }
	}

	const promises = await Promise.all([getStatsTotal(supabaseClient), getStats()])
	return { total: promises[0], stats: promises[1], range: range }
}
