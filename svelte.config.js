import { mdsvex, escapeSvelte } from "mdsvex"
import adapter from "@sveltejs/adapter-node"
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte"
import { getSingletonHighlighter } from "shiki"

const shikiHighlighter = await getSingletonHighlighter({
	themes: ["github-dark", "github-light"],
	langs: ["javascript", "typescript", "bash", "cmd", "yml", "yaml", "pascal", "java"]
})

const mdsvexOptions = {
	extensions: [".md"],
	highlight: {
		highlighter: async (code, lang = "text") => {
			if (lang === "freepascal") lang = "pascal"
			const html = escapeSvelte(
				shikiHighlighter.codeToHtml(code, {
					lang,
					themes: { light: "github-light", dark: "github-dark" }
				})
			)
			return `{@html \`${html}\` }`
		}
	}
}

const config = {
	compilerOptions: { runes: true },
	vitePlugin: {
		dynamicCompileOptions({ filename }) {
			if (filename.includes("node_modules")) {
				return { runes: undefined } // or false, check what works
			}
		}
	},
	preprocess: [vitePreprocess(), mdsvex(mdsvexOptions)],
	kit: { adapter: adapter() },
	extensions: [".svelte", ".svx", ".md"]
}

export default config
