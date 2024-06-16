import { getStatsTotal } from "$lib/client/supabase"
import { streamedErrorHandler } from "$lib/client/utils"

export const load = async ({ depends, parent }) => {
	depends("supabase:home_stats_total")
	const { supabaseClient } = await parent()
	const totalPromise = getStatsTotal(supabaseClient)
	totalPromise.catch((err) => streamedErrorHandler(err))
	return { totalPromise }
}
