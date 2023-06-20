export const load = async ({ locals: { getSession, getProfile } }) => {
	return { session: getSession(), profile: getProfile() }
}
