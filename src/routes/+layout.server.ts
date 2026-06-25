export const load = async ({ locals: { safeGetSession }, cookies, setHeaders }) => {
	const darkMode = cookies.get("darkMode") === "true"
	const theme = cookies.get("theme") ?? "wasp"
	const { session } = await safeGetSession()

	setHeaders({
		"Strict-Transport-Security": "max-age=31536000; includeSubDomains",
		"X-Frame-Options": "SAMEORIGIN",
		"X-Content-Type-Options": "nosniff",
		"Referrer-Policy": "origin-when-cross-origin",
		"Permissions-Policy":
			"geolocation=(self), microphone=(self), camera=(self), fullscreen=(self), payment=(self), midi=(self)"
	})

	return {
		darkMode,
		theme,
		session,
		cookies: cookies.getAll()
	}
}
