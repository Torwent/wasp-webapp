import { redirect } from "@sveltejs/kit"
import { getDeveloper, getDeveloperUUID } from "$lib/backend/data"
import { UUID_V4_REGEX } from "$lib/utils"

export const load = async ({ params }) => {
	let { slug } = params
	if (!slug) throw redirect(300, "/devs")

	const developer = UUID_V4_REGEX.test(slug)
		? await getDeveloperUUID(slug)
		: await getDeveloper(slug.toLowerCase())
	if (!developer) throw redirect(300, "/devs")

	return { developer }
}
