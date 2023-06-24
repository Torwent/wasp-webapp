import type { ErrorEntry, FAQEntry } from "$lib/types/collection"
import { redirect } from "@sveltejs/kit"

export const load = async ({ parent }) => {
	const { supabaseClient } = await parent()
	const promises = await Promise.all([
		supabaseClient.from("faq_questions").select("id, title, content").returns<FAQEntry[]>(),
		supabaseClient.from("faq_errors").select("id, title, content").returns<ErrorEntry[]>()
	])

	const questions = promises[0]
	const errors = promises[1]
	if (questions.error) {
		console.error("faq_questions SELECT failed: ", questions.error.message)
		throw redirect(303, "./")
	}

	if (errors.error) {
		console.error("faq_questions SELECT failed: ", errors.error.message)
		throw redirect(303, "./")
	}
	return { questions: questions.data, errors: errors.data }
}
