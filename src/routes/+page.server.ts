import type { Actions } from "@sveltejs/kit"

export const actions = {
	toggleDark: async (event) => {
		let dark = event.cookies.get("darkMode")
		if (!dark) dark = "true"
		event.cookies.set("darkMode", dark === "true" ? "false" : "true", {
			path: "/",
			maxAge: 60 * 60 * 24 * 7 * 360
		})
	},
	setTheme: async ({ cookies, request }) => {
		const formData = await request.formData()
		const theme = formData.get("theme")?.toString().toLowerCase() ?? "fennec"
		cookies.set("theme", theme, { path: "/", maxAge: 60 * 60 * 24 * 7 * 360 })
	}
} satisfies Actions
