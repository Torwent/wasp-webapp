import { supabaseHelper } from "$lib/backend/auth"
import type { Stat } from "$lib/backend/types"
import { UUID_V4_REGEX } from "$lib/utils"

export const load = async ({ url, depends }) => {
	depends("stats:total")

	const order = url.searchParams.get("order") || "experience"
	const ascending = url.searchParams.get("ascending")?.toLowerCase() === "true"
	const search = decodeURIComponent(url.searchParams.get("search") || "").trim()

	const pageStr = url.searchParams.get("page") || "-1"
	const page = Number(pageStr) < 0 || Number.isNaN(Number(pageStr)) ? 1 : Number(pageStr)

	const range = 30
	const start = (page - 1) * range
	const finish = start + range

	let total: Stat = {
		username: "Total",
		experience: 0,
		gold: 0,
		levels: 0,
		runtime: 0
	}

	const totalEntries = 10

	let promises = []

	if (search === "") {
		promises.push(
			supabaseHelper
				.from("stats")
				.select("username, experience, gold, levels, runtime", { count: "exact" })
				.or("experience.gt.0,gold.gt.0")
				.order(order, { ascending: ascending })
				.range(start, finish)
		)
	} else if (UUID_V4_REGEX.test(search)) {
		promises.push(
			supabaseHelper
				.from("stats")
				.select("username, experience, gold, levels, runtime", { count: "exact" })
				.eq("userID", search)
		)
	} else {
		promises.push(
			supabaseHelper
				.from("stats")
				.select("username, experience, gold, levels, runtime", { count: "exact" })
				.ilike("username", "%" + search.replaceAll("%", "") + "%")
		)
	}

	promises.push(supabaseHelper.rpc("get_stats_total"))

	promises = await Promise.all(promises)

	const { data, count, error } = promises[0]
	const { data: tData, error: tError } = promises[1]

	if (error) {
		const response = {
			total: total,
			stats: [],
			totalEntries: totalEntries,
			range: range,
			status: 500,
			error: new Error(
				`The server failed to fetch data from the database. This is not an issue on your side! Error message:\n\n${error.message}`
			)
		}
		return response
	}

	if (tError) {
		const response = {
			total: total,
			stats: [],
			totalEntries: totalEntries,
			range: range,
			status: 500,
			error: new Error(
				`The server failed to fetch total data from the database. This is not an issue on your side! Error message:\n\n${tError.message}`
			)
		}
		return response
	}

	const totalData = tData[0] as Stat

	total.experience += totalData.experience
	total.gold += totalData.gold
	total.levels += totalData.levels
	total.runtime += totalData.runtime

	return { total: total, stats: data, count: count || totalEntries, range: range }
}
