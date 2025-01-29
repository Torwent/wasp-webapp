import { error } from "@sveltejs/kit"

export const load = async ({ data, params: { slug } }) => {
	if (!data || !data.meta) error(404, "Could not find " + slug + " tutorial.")

	try {
		const tutorial = await import(`../../../wasp-info/tutorials/${data.meta.order}.md`)
		return {
			content: tutorial.default,
			meta: data.meta
		}
	} catch (e) {
		error(404, `Could not find ${slug}`)
	}
}
