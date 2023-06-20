import { getDeveloper, getDeveloperUUID } from "$lib/backend/data"
import type { Developer } from "$lib/backend/types"
import { UUID_V4_REGEX } from "$lib/utils"
import { redirect } from "@sveltejs/kit"

export const load = async ({ params, parent }) => {
	const { developersData } = await parent()
	const { slug } = params

	const { data, error } = developersData
	if (error) {
		console.error(error)
		throw redirect(303, "/scripts")
	}

	const developers = data as unknown as Developer[]

	const developer = UUID_V4_REGEX.test(slug)
		? await getDeveloperUUID(slug, developers)
		: await getDeveloper(slug, developers)
	if (!developer) throw redirect(300, "./")
	return { developer }
}
