import { supabaseClient } from "$lib/backend/auth"
import type { PageLoad } from "./$types"

export const load: PageLoad = async ({ parent }) => {
	const questions = supabaseClient.from("faq_questions").select("id, title, content")
	const errors = supabaseClient.from("faq_errors").select("id, title, content")
	return { questions, errors }
}
