import type { Stats } from "$lib/types/collection"
import { error } from "@sveltejs/kit"

export const load = async ({ depends, parent }) => {
	depends("supabase:home_stats_total")

	async function getTotals() {
		const total = {
			experience: 0,
			gold: 0,
			levels: 0,
			runtime: 0
		}
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

		total.experience = data[0].experience || 0
		total.gold = data[0].gold || 0
		total.levels = data[0].levels || 0
		total.runtime = data[0].runtime || 0
		return total
	}

	return { total: getTotals() }
}
