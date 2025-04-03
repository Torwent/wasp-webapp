import tailwindcss from "@tailwindcss/vite"
import { sveltekit } from "@sveltejs/kit/vite"
import { defineConfig } from "vite"
import llms from "vite-plugin-llms"

export default defineConfig({
	plugins: [tailwindcss(), sveltekit(), llms()]
})
