import type { Load } from "@sveltejs/kit"
import { supabase } from "$lib/database/supabase"
import { loadError } from "$lib/utils"

export const load: Load = async () => {
	const { data: dataQ, error: errorQ } = await supabase.from("faq_questions").select("*")
	if (errorQ) return loadError(errorQ.toString())

	const { data: dataE, error: errorE } = await supabase.from("faq_errors").select("*")
	if (errorE) return loadError(errorE.toString())

	return { questions: dataQ, errors: dataE }
}
