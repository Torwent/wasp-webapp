import { getTutorial } from "$lib/server/utils.server"
import { error, json } from "@sveltejs/kit"

export async function GET({ params: { slug } }) {
	const tutorial = await getTutorial(slug)
	if (!tutorial) error(404, "Can't find " + slug)
	return json(tutorial)
}
