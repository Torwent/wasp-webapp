import type { LayoutServerLoad } from "./$types"

export const load: LayoutServerLoad = async ({ locals: { getSession, getProfile } }) => {
	return {
		session: getSession(),
		profile: getProfile()
	}
}
