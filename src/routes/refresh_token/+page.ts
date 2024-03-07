import { error } from "@sveltejs/kit"

export const load = async ({ parent }) => {
	const { session, profile } = await parent()
	if (!session || !profile) throw error(401, "You must be logged in to access this page")
	return { refresh_token: session.refresh_token }
}
