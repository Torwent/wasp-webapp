import { getStatsTotal } from "$lib/client/supabase"
import { UUID_V4_REGEX, formatError } from "$lib/utils"
import type { SupabaseClient } from "@supabase/supabase-js"
import { error } from "@sveltejs/kit"

export const load = async ({ url, depends, parent }) => {
	depends("supabase:stats")

	const pageN = Number(url.searchParams.get("page") || "-1")
	const page = pageN < 0 || Number.isNaN(pageN) ? 1 : pageN

	const amountN = Number(url.searchParams.get("amount") || "20")
	const amount = amountN < 0 || Number.isNaN(amountN) ? 1 : amountN

	const order = url.searchParams.get("order") || "experience"
	const ascending = url.searchParams.get("ascending")?.toLowerCase() === "true"
	const search = decodeURIComponent(url.searchParams.get("search") || "").trim()

	const start = (page - 1) * amount
	const finish = start + amount - 1

	const totalEntries = 10

	const { supabaseClient } = await parent()

	async function getStats(supabase: SupabaseClient) {
		const query = supabase
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
			query
				.ilike("username", "%" + search.replaceAll("%", "") + "%")
				.range(start, finish)
				.order(order, { ascending: ascending, nullsFirst: false })
		}

		const { data, count, error: err } = await query

		if (err) {
			error(
				500,
				"Server error, this is probably not an issue on your end!\n" +
					"SELECT stats failed!\n\n" +
					formatError(err)
			)
		}

		return { stats: data, count: count || totalEntries }
	}

	const promises = await Promise.all([getStatsTotal(supabaseClient), getStats(supabaseClient)])

	return { totals: promises[0], stats: promises[1], amount }
}
