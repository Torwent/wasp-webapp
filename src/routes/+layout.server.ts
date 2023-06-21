export const load = async ({ locals: { getSession } }) => {
	return { session: getSession() }
}
