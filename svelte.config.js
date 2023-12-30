import adapter from "@sveltejs/adapter-vercel"
import { vitePreprocess } from "@sveltejs/kit/vite"

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),

	kit: {
		adapter: adapter(),
		csp: {
			mode: "auto",
			directives: {
				"frame-src": ["self", "https://connect-js.stripe.com", "https://js.stripe.com"],
				"script-src": [
					"self",
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
