import { WaspCategories } from "$lib/client/supabase"
import { streamedErrorHandler } from "$lib/client/utils"

export const load = async ({ parent }) => {
	const { supabaseClient } = await parent()

	const promises = await Promise.all([
		WaspCategories.getCategories(supabaseClient),
		WaspCategories.getSubCategories(supabaseClient),
		WaspCategories.getTooltips(supabaseClient)
	])

	return { categories: promises[0], subcategories: promises[1], tooltips: promises[2] }
}
