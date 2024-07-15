import { WaspFAQ } from "$lib/client/supabase"
import { streamedErrorHandler } from "$lib/client/utils"

export const load = async ({ parent }) => {
	const { supabaseClient } = await parent()
	const questions = WaspFAQ.getFAQ(supabaseClient, "questions")
	const errors = WaspFAQ.getFAQ(supabaseClient, "errors")

	questions.catch((err) => streamedErrorHandler(err))
	errors.catch((err) => streamedErrorHandler(err))

	return { questions, errors }
}
