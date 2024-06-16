import { error, redirect } from "@sveltejs/kit"

export const load = async ({ parent }) => {
	const { user } = await parent()
	if (!user) error(403, "You need to be logged in.")
	redirect(303, "/dashboard/" + user.id)
}
