import { WaspFAQ } from "$lib/client/supabase"
import { mdvsvexCompile } from "$lib/server/markdown.server"
import type { FAQEntry } from "$lib/types/collection"

export const load = async ({ locals: { supabaseServer } }) => {
	const questions = WaspFAQ.getFAQ(supabaseServer, "questions")
	const errors = WaspFAQ.getFAQ(supabaseServer, "errors")

	async function transform(faqPromise: Promise<FAQEntry[]>) {
		const faq = await faqPromise

		return await Promise.all(
			faq.map(async (entry) => {
				return {
					title: entry.title,
					content: await mdvsvexCompile(entry.content)
				}
			})
		)
	}

	const promise = await Promise.all([transform(questions), transform(errors)])

	return { questions: promise[0], errors: promise[1] }
}
