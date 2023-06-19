import type { Stat } from "$lib/backend/types"

export const load = async ({ depends, parent }) => {
	const parentPromise = parent()
	depends("supabase:stats_total")
	let total: Stat = {
		username: "Total",
		experience: 0,
		gold: 0,
		levels: 0,
		runtime: 0
	}

	const { supabaseClient } = await parentPromise
	const { data, error } = await supabaseClient.rpc("get_stats_total")

	if (error) {
		const response = {
			total: total,
			stats: [],
			status: 500,
			error: new Error(
				`The server failed to fetch data from the database. This is not an issue on your side! Error message:\n\n${error.message}`
			)
		}
		return response
	}

	const totalData = data[0] as Stat

	total.experience += totalData.experience
	total.gold += totalData.gold
	total.levels += totalData.levels
	total.runtime += totalData.runtime

	return { total: total }
}
