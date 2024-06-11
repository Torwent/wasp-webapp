import { getStatsTotal } from "$lib/client/data"

export const load = async ({ depends, parent }) => {
	depends("supabase:home_stats_total")
	const { supabaseClient } = await parent()
	return { total: getStatsTotal(supabaseClient) }
}
