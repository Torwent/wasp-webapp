export const load = async ({ parent }) => {
	const { supabaseClient } = await parent()
	const questions = supabaseClient.from("faq_questions").select("id, title, content")
	const errors = supabaseClient.from("faq_errors").select("id, title, content")
	return { questions, errors }
}
