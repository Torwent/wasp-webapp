import { supabaseHelper } from "$lib/backend/auth"
import type { PageLoad } from "./$types"

export const load: PageLoad = async ({ setHeaders }) => {
	setHeaders({
		"cache-control": "max-age=60"
	})
	const questions = supabaseHelper.from("faq_questions").select("id, title, content")
	const errors = supabaseHelper.from("faq_errors").select("id, title, content")
	return { questions, errors }
}
