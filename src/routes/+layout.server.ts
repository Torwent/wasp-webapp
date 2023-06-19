export const load = async ({ locals: { getSession, getProfile }, depends }) => {
	depends("supabase:auth")
	return { session: getSession(), profile: getProfile() }
}
