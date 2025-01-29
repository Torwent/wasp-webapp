import { WaspFAQ } from "$lib/client/supabase"
import { shikiHighlighter } from "$lib/server/utils.server"
import type { FAQEntry } from "$lib/types/collection"
import { compile, escapeSvelte } from "mdsvex"

export const load = async ({ locals: { supabaseServer }, cookies }) => {
	const darkMode = cookies.get("darkMode") === "true"
	const questions = WaspFAQ.getFAQ(supabaseServer, "questions")
	const errors = WaspFAQ.getFAQ(supabaseServer, "errors")

	async function transform(faqPromise: Promise<FAQEntry[]>) {
		const faq = await faqPromise

		return await Promise.all(
			faq.map(async (entry) => {
				return {
					title: entry.title,
					content: await compile(entry.content, {
						highlight: {
							highlighter: async (code, lang = "text") => {
								if (!lang) lang = "text"
								else if (lang === "freepascal") lang = "pascal"
								return escapeSvelte(
									shikiHighlighter.codeToHtml(code, {
										lang,
										theme: darkMode ? "github-dark" : "github-light"
									})
								)
							}
						}
					})
				}
			})
		)
	}

	const promise = await Promise.all([transform(questions), transform(errors)])

	return { questions: promise[0], errors: promise[1] }
}
