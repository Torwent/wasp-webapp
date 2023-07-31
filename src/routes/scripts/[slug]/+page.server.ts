export const load = async ({ cookies }) => {
	return { dismissed: cookies.get("warning_dismissed") === "true" }
}
