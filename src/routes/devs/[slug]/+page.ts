import { redirect, type Load } from "@sveltejs/kit"
import { getDeveloper } from "$lib/backend/data"

export const load: Load = async ({ params, parent }) => {
	let { slug } = params
	if (!slug) throw redirect(300, "/devs")

	await parent()

	const developer = await getDeveloper(slug.toLowerCase())
	if (!developer) throw redirect(300, "/devs")

	return { developer }
}
