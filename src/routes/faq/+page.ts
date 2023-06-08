import type { PageLoad } from "./$types"

export const load: PageLoad = async ({ setHeaders, parent }) => {
	const tmp = parent()
	setHeaders({
		"cache-control": "max-age=60"
	})

	const { supabase } = await tmp
	const questions = supabase.from("faq_questions").select("id, title, content")
	const errors = supabase.from("faq_errors").select("id, title, content")
	return { questions, errors }
}
