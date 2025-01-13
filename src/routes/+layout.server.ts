export const load = async ({ locals: { safeGetSession }, cookies }) => {
	const darkMode = cookies.get("darkMode") === "true"
	const theme = cookies.get("theme") ?? "fennec"
	const { session } = await safeGetSession()

	return {
		darkMode,
		theme,
		session,
		cookies: cookies.getAll()
	}
}
