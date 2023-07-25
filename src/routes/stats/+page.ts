import type { Stats } from "$lib/types/collection"
import { UUID_V4_REGEX } from "$lib/utils"
import { error } from "@sveltejs/kit"

export const load = async ({ url, depends, parent }) => {
	depends("supabase:stats")

	const order = url.searchParams.get("order") || "experience"
	const ascending = url.searchParams.get("ascending")?.toLowerCase() === "true"
	const search = decodeURIComponent(url.searchParams.get("search") || "").trim()

	const pageStr = url.searchParams.get("page") || "-1"
	const page = Number(pageStr) < 0 || Number.isNaN(Number(pageStr)) ? 1 : Number(pageStr)

	const range = 30
	const start = (page - 1) * range
	const finish = start + range

	const totalEntries = 10

	async function getTotal() {
		const { supabaseClient } = await parent()

		const { data, error: err } = await supabaseClient.rpc("get_stats_total").returns<Stats[]>()

		if (err)
			throw error(
				500,
				`Server error, this is probably not an issure on your end! - SELECT get_stats_total postgres function failed
			Error code: ${err.code}
			Error hint: ${err.hint}
			Error details: ${err.details}
			Error hint: ${err.message}`
			)

		const total: Stats = {
			username: "Total",
			experience: data[0].experience || 0,
			gold: data[0].gold || 0,
			levels: data[0].levels || 0,
			runtime: data[0].runtime || 0,
			password: "",
			updated_at: null,
			userID: ""
		}

		return total
	}

	async function getStats() {
		const { supabaseClient } = await parent()

		const query = supabaseClient
			.from("stats")
			.select("username, experience, gold, levels, runtime", { count: "exact" })

		if (search === "") {
			query
				.or("experience.gt.0,gold.gt.0")
				.range(start, finish)
				.order(order, { ascending: ascending, foreignTable: "", nullsFirst: false })
		} else if (UUID_V4_REGEX.test(search)) {
			query.eq("userID", search)
		} else {
			query.ilike("username", "%" + search.replaceAll("%", "") + "%")
		}

		const { data, count, error: err } = await query.returns<Stats[]>()

		if (err)
			throw error(
				500,
				`Server error, this is probably not an issure on your end! - SELECT stats failed
			Error code: ${err.code}
			Error hint: ${err.hint}
			Error details: ${err.details}
			Error hint: ${err.message}`
			)

		return { stats: data, count: count || totalEntries }
	}
	return { total: getTotal(), stats: getStats(), range: range }
}
