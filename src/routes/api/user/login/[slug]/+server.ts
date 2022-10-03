import { json } from "@sveltejs/kit"
import type { RequestHandler } from "@sveltejs/kit"

export const POST: RequestHandler = async ({ params }) => {
	const { slug } = params
	if (slug == null) return json("Missing user")

	return json("")
}
