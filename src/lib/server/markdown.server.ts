import { compile, escapeSvelte } from "mdsvex"
import { createHighlighter } from "shiki"

const shikiHighlighter = await createHighlighter({
	themes: ["github-dark", "github-light"],
	langs: ["javascript", "typescript", "bash", "cmd", "yml", "yaml", "pascal"]
})

export async function mdvsvexCompile(content: string) {
	return await compile(content, {
		highlight: {
			highlighter: async (code: string, lang = "text") => {
				if (lang === "freepascal") lang = "pascal"
				return escapeSvelte(
					shikiHighlighter.codeToHtml(code, {
						lang,
						themes: { light: "github-light", dark: "github-dark" }
					})
				)
			}
		}
	})
}
