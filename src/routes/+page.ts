import type { Stats } from "$lib/types/collection"
import { error } from "@sveltejs/kit"

export const load = async ({ depends, parent }) => {
	const parentPromise = parent()
	depends("supabase:stats_total")
	const total: Stats = {
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

	total.experience = data[0].experience
	total.gold = data[0].gold
	total.levels = data[0].levels
	total.runtime = data[0].runtime

	return { total }
}
