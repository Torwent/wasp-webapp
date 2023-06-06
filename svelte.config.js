import adapter from "@sveltejs/adapter-node"
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
					"sha256-PBmRLzA7Ofi7WtgbjS5vmS9t83AYv5oRRywasLtzZ9Y=",
					"unsafe-inline"
				],
				"base-uri": ["self"],
				"object-src": ["none"]
			}
		}
	}
}

export default config
