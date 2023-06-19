import { redirect } from "@sveltejs/kit"

export const load = async ({ params, data, parent }) => {
	const { session, profile } = await parent()
	if (!session || !profile) throw redirect(303, "/")

	const email = session.user.email
	const { slug } = params

	if (profile.id != slug || !data) throw redirect(303, "./")
	const { address, form } = data

	return { form, email, address }
}
