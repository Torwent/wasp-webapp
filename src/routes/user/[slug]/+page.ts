import { error } from "@sveltejs/kit"

export const load = async ({ params, data, parent }) => {
	const { session, profile } = await parent()
	if (!session || !profile) throw error(401, "You must be logged in to access this page")

	const email = session.user.email
	const { slug } = params

	if (profile.id != slug || !data) throw error(403, "You can only view and edit your own profile")
	const { address, form } = data

	return { form, email, address }
}
