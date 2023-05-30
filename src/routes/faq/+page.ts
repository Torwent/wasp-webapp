import type { PageLoad } from "./$types"

export const load: PageLoad = async ({ parent }) => {
	const { supabase } = await parent()
	const questions = supabase.from("faq_questions").select("id, title, content")
	const errors = supabase.from("faq_errors").select("id, title, content")
	return { questions, errors }
}
