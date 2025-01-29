import { getStatsTotal } from "$lib/client/supabase"

export const load = async ({ depends, parent }) => {
	depends("supabase:home_stats_total")
	const { supabaseClient } = await parent()
	return { totals: await getStatsTotal(supabaseClient) }
}
