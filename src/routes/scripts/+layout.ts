import { WaspCategories } from "$lib/client/supabase"
import { streamedErrorHandler } from "$lib/client/utils"

export const load = async ({ parent }) => {
	const { supabaseClient } = await parent()

	const categoriesPromise = WaspCategories.getCategories(supabaseClient)
	const subcategoriesPromise = WaspCategories.getSubCategories(supabaseClient)
	const tooltips = WaspCategories.getTooltips(supabaseClient)

	categoriesPromise.catch((err) => streamedErrorHandler(err))
	subcategoriesPromise.catch((err) => streamedErrorHandler(err))
	tooltips.catch((err) => streamedErrorHandler(err))

	return { categoriesPromise, subcategoriesPromise, tooltips }
}
