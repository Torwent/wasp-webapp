import { supabase } from "$lib/database/supabase"
import type { PageLoad } from "./$types"

export const load: PageLoad = async () => {
	const { data: dataQ, error: errorQ } = await supabase.from("faq_questions").select("*")
	if (errorQ)
		return {
			questions: [],
			errors: [],
			status: 500,
			error: new Error(
				`Server failed to fetch from faq_questions. Error message:\n\n${errorQ.message}`
			)
		}

	const { data: dataE, error: errorE } = await supabase.from("faq_errors").select("*")
	if (errorE)
		return {
			questions: [],
			errors: [],
			status: 500,
			error: new Error(
				`Server failed to fetch from faq_errors. Error message:\n\n${errorE.message}`
			)
		}

	return { questions: dataQ, errors: dataE }
}
