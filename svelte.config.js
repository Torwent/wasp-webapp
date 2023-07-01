import adapter from "@sveltejs/adapter-auto"
import { vitePreprocess } from "@sveltejs/kit/vite"

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),

	kit: {
		adapter: adapter(),
		csp: {
			mode: "auto",
			directives: {
				"script-src": [
					"self",
					"https://enqlpchobniylwpsjcqc.supabase.co/",
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
