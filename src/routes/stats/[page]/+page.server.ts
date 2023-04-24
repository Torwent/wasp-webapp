import { SERVICE_USER, SERVICE_PASS } from "$env/static/private"
import { supabase } from "$lib/database/supabase"
import type { Stat } from "$lib/database/types"
import type { PageServerLoad } from "./$types"

const UUID_V4_REGEX =
	/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[4][0-9a-fA-F]{3}-[89AB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/i

export const load: PageServerLoad = async ({ params, url, depends }) => {
	depends("stats:total")

	const order = url.searchParams.get("order") || "experience"
	const ascending = url.searchParams.get("ascending")?.toLowerCase() === "true"
	const search = url.searchParams.get("search") || ""

	const range = 35
	const page = Number(params.page) || 1

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

	if (supabase.auth.user() == null) {
		const { error } = await supabase.auth.signIn({
			email: SERVICE_USER,
			password: SERVICE_PASS
		})
		if (error) {
			const response = {
				total: total,
				stats: [],
				totalEntries: totalEntries,
				range: range,
				status: 500,
				error: new Error(
					`The server failed to login to the database. This is not an issue on your side! Error message:\n\n${error.message}`
				)
			}
			return response
		}
	}

	let promises = []

	if (search === "") {
		promises.push(
			supabase
				.from("stats")
				.select("username, experience, gold, levels, runtime", { count: "exact" })
				.or("experience.gt.0,gold.gt.0")
				.order(order, { ascending: ascending })
				.range(start, finish)
		)
	} else if (UUID_V4_REGEX.test(search)) {
		promises.push(
			supabase
				.from("stats")
				.select("username, experience, gold, levels, runtime", { count: "exact" })
				.eq("userID", search)
		)
	} else {
		promises.push(
			supabase
				.from("stats")
				.select("username, experience, gold, levels, runtime", { count: "exact" })
				.textSearch("username", search, { type: "plain" })
		)
	}

	promises.push(supabase.rpc("get_stats_total"))

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

	return { total: total, stats: data, totalEntries: count || totalEntries, range: range }
}
