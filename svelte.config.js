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
					"https://dev.waspscripts.com",
					"https://waspscripts.com",
					"https://www.waspscripts.com",
					"sha256-PBmRLzA7Ofi7WtgbjS5vmS9t83AYv5oRRywasLtzZ9Y=",
					"nonce-MXOh/w1kJktu/eFCKBjq5g==",
					"unsafe-inline"
				],
				"base-uri": ["self"],
				"object-src": ["none"]
			}
		}
	}
}

export default config
