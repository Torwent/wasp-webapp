import { getStatsTotal } from "$lib/backend/data"

export const load = async ({ depends, parent }) => {
	depends("supabase:home_stats_total")
	const { supabaseClient } = await parent()
	return { total: await getStatsTotal(supabaseClient) }
}
