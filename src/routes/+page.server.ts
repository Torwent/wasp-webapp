export const actions = {
	toggleDark: async (event) => {
		let dark = event.cookies.get("darkMode")
		if (!dark) dark = "true"
		event.cookies.set("darkMode", dark === "true" ? "false" : "true", {
			path: "/",
			maxAge: 60 * 60 * 24 * 7 * 360
		})
	},
	setTheme: async ({ cookies, url: { searchParams } }) => {
		const theme = searchParams.get("/setTheme") || "wasp"
		cookies.set("theme", theme, { path: "/", maxAge: 60 * 60 * 24 * 7 * 360 })
	}
}
