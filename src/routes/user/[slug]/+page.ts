import type { PageLoad } from "./$types"
import { redirect } from "@sveltejs/kit"

export const load: PageLoad = async ({ parent, params, data }) => {
	const { session, profile } = await parent()
	if (!session || !profile) throw redirect(303, "/")

	const email = session.user.email
	const { slug } = params

	if (profile.id != slug) throw redirect(303, "/user/" + profile.id)

	const { address, form } = data

	return { form, email, address }
}
