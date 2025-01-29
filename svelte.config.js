import { mdsvex, escapeSvelte } from "mdsvex"
import adapter from "@sveltejs/adapter-auto"
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte"
import { getSingletonHighlighter } from "shiki"

const highlighter = await getSingletonHighlighter({
	themes: ["github-dark"],
	langs: ["javascript", "typescript", "bash", "cmd", "yml", "yaml", "pascal"]
})

/** @type {import('mdsvex').MdsvexOptions} */
const mdsvexOptions = {
	extensions: [".md"],
	highlight: {
		highlighter: async (code, lang = "text") => {
			try {
				const html = escapeSvelte(highlighter.codeToHtml(code, { lang, theme: "github-dark" }))
				return `{@html \`${html}\` }`
			} catch (error) {
				lang = "cmd"
				const html = escapeSvelte(highlighter.codeToHtml(code, { lang, theme: "github-dark" }))
				return `{@html \`${html}\` }`
			}
		}
	}
}

/** @type {import('@sveltejs/kit').Config} */
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

	kit: {
		// adapter-auto only supports some environments, see https://svelte.dev/docs/kit/adapter-auto for a list.
		// If your environment is not supported, or you settled on a specific environment, switch out the adapter.
		// See https://svelte.dev/docs/kit/adapters for more information about adapters.
		adapter: adapter()
	},

	extensions: [".svelte", ".svx", ".md"]
}

export default config
