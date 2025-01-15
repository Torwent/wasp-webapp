import { WaspFAQ } from "$lib/client/supabase"
import type { FAQEntry } from "$lib/types/collection"
import { compile, escapeSvelte } from "mdsvex"
import { createHighlighter } from "shiki"

const highlighter = await createHighlighter({
	themes: ["github-dark", "github-light"],
	langs: ["javascript", "typescript", "cmd", "pascal"]
})

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
									highlighter.codeToHtml(code, {
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
