import { redirect, type Load } from "@sveltejs/kit"
import { getPost } from "$lib/backend/data"

export const load: Load = async ({ params }) => {
	let { slug } = params
	if (slug == null) throw redirect(300, "/tutorials")

	const post = await getPost(slug)
	if (!post) throw redirect(300, "/tutorials")

	return { post }
}
