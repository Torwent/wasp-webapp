import type { ErrorEntry, FAQEntry } from "$lib/types/collection"
import { error } from "@sveltejs/kit"

export const load = async ({ parent }) => {
	async function getQuestions() {
		const { supabaseClient } = await parent()

		const questions = await supabaseClient
			.from("faq_questions")
			.select("id, title, content")
			.returns<FAQEntry[]>()

		if (questions.error) {
			throw error(
				500,
				`Server error, this is probably not an issure on your end! - SELECT faq_questions failed
			Error code: ${questions.error.code}
			Error hint: ${questions.error.hint}
			Error details: ${questions.error.details}
			Error hint: ${questions.error.message}`
			)
		}
		return questions
	}

	async function getErrors() {
		const { supabaseClient } = await parent()

		const errors = await supabaseClient
			.from("faq_errors")
			.select("id, title, content")
			.returns<ErrorEntry[]>()

		if (errors.error) {
			throw error(
				500,
				`Server error, this is probably not an issure on your end! - SELECT faq_errors failed
			Error code: ${errors.error.code}
			Error hint: ${errors.error.hint}
			Error details: ${errors.error.details}`
			)
		}
		return errors.data
	}
	return { questions: getQuestions(), errors: getErrors() }
}
