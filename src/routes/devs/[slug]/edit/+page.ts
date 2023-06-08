import { redirect, type Load } from "@sveltejs/kit"
import { getDeveloper } from "$lib/backend/data"

export const load: Load = async ({ params, data, parent }) => {
	const tmp = parent()
	const { slug } = params
	if (slug == null) throw redirect(300, "/devs")

	await tmp
	const developer = await getDeveloper(slug.toLowerCase())
	if (!developer) throw redirect(300, "/devs")

	if (!data) throw redirect(300, "/devs/" + slug)
	const { form } = data

	return { developer, form }
}
