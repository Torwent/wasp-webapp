import type { ErrorEntry, FAQEntry } from "$lib/types/collection"
import { error } from "@sveltejs/kit"

export const load = async ({ parent }) => {
	const { supabaseClient } = await parent()

	const promises = await Promise.all([
		supabaseClient.from("faq_questions").select("id, title, content").returns<FAQEntry[]>(),
		supabaseClient.from("faq_errors").select("id, title, content").returns<ErrorEntry[]>()
	])

	const questions = promises[0]

	if (questions.error) {
		throw error(
			500,
			`Server error, this is probably not an issue on your end! - SELECT faq_questions failed
			Error code: ${questions.error.code}
			Error hint: ${questions.error.hint}
			Error details: ${questions.error.details}
			Error hint: ${questions.error.message}`
		)
	}

	const errors = promises[1]

	if (errors.error) {
		throw error(
			500,
			`Server error, this is probably not an issue on your end! - SELECT faq_errors failed
			Error code: ${errors.error.code}
			Error hint: ${errors.error.hint}
			Error details: ${errors.error.details}`
		)
	}

	return { questions: questions.data, errors: errors.data }
}
