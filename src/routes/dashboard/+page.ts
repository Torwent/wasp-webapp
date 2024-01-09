import { error, redirect } from "@sveltejs/kit"

export const load = async ({ parent }) => {
	const { profile } = await parent()
	if (!profile) throw error(403, "You need to be logged in.")
	throw redirect(303, "/dashboard/" + profile.id)
}
