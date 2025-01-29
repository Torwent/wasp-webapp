import { getTutorial } from "$lib/server/utils.server"

export const load = async ({ params: { slug } }) => {
	return { meta: await getTutorial(slug) }
}
