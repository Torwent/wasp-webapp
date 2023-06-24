import type { Stats } from "$lib/types/collection"

export const load = async ({ depends, parent }) => {
	const parentPromise = parent()
	depends("supabase:stats_total")
	let total: Stats = {
		username: "Total",
		experience: 0,
		gold: 0,
		levels: 0,
		runtime: 0,
		password: "",
		updated_at: null,
		userID: ""
	}

	const { supabaseClient } = await parentPromise
	const { data, error } = await supabaseClient.rpc("get_stats_total").returns<Stats[]>()

	if (error) {
		console.error("get_stats_total SELECT failed: " + error.message)
		const response = {
			total: total,
			status: 500,
			error: new Error(
				`The server failed to fetch data from the database. This is not an issue on your side! Error message:\n\n${error.message}`
			)
		}
		return response
	}

	total.experience = data[0].experience
	total.gold = data[0].gold
	total.levels = data[0].levels
	total.runtime = data[0].runtime

	return { total }
}
