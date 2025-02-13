import { getTutorial } from "$lib/server/tutorials.server"

export const load = async ({ params: { slug } }) => {
	return { meta: await getTutorial(slug) }
}
