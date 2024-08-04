import adapter from "@sveltejs/adapter-node"
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte"
import { mdsvex, escapeSvelte } from "mdsvex"
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
	extensions: [".svelte", ".md"],
	preprocess: [vitePreprocess(), mdsvex(mdsvexOptions)],

	vitePlugin: { inspector: true },
	kit: {
		adapter: adapter(),
		csp: {
			mode: "auto",
			directives: {
				"frame-src": [
					"self",
					"https://stripe-data-exports.s3.amazonaws.com/",
					"https://connect-js.stripe.com",
					"https://js.stripe.com",
					"https://www.youtube.com/"
				],
				"script-src": [
					"self",
					"https://db.waspscripts.com/",
					"https://enqlpchobniylwpsjcqc.supabase.co/",
					"https://js.stripe.com/",
					"https://connect-js.stripe.com",
					"sha256-NIGxH81XzlJ1MLZd3Miw/iZ1aTKLJT4aAbU5iVmRLTw=",
					"unsafe-inline",
					"sha256-PBmRLzA7Ofi7WtgbjS5vmS9t83AYv5oRRywasLtzZ9Y=", //dev
					"sha256-k5HJr61/45h+hLBmZFy0IrJtHlGahgw6wXNW3ccZaAI=" //build
				],
				"base-uri": ["self"],
				"object-src": ["none"]
			}
		}
	}
}
export default config
