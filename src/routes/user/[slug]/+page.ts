import { error } from "@sveltejs/kit"

export const load = async ({ params: { slug }, data, parent }) => {
	const { session, roles } = await parent()
	if (!session) error(401, "You must be logged in to access this page")

	if (session.user.id != slug && !roles?.administrator)
		error(403, "You can only view and edit your own profile")
	const { form, email } = data

	if (!form) error(500, "Something went wrong when fetching information from the server!")

	form.data.email = email
	return { form }
}
