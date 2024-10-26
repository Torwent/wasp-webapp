import type { Tutorial } from "$lib/types/collection"
import { error } from "@sveltejs/kit"

export const prerender = true

export const load = async ({ params: { slug }, fetch }) => {
	const response = await fetch("/api/tutorials/" + slug)
	const meta: Tutorial = await response.json()
	try {
		const tutorial = await import(`../../../wasp-info/tutorials/${meta.order}.md`)
		return {
			content: tutorial.default,
			meta
		}
	} catch (e) {
		error(404, `Could not find ${slug}`)
	}
}
