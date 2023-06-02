import type { LayoutServerLoad } from "./$types"

export const load: LayoutServerLoad = async ({ locals: { getSession, getProfile } }) => {
	return {
		session: await getSession(),
		profile: await getProfile()
	}
}
