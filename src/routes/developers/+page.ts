import { browser } from "$app/environment"
import { encodeSEO } from "$lib/utils"
import { redirect } from "@sveltejs/kit"

export const load = async ({ parent }) => {
	const { developersData, range } = await parent()
	const { data, count, error } = developersData

	if (error) {
		console.error(error)
		throw redirect(303, "./")
	}
	const devs = data

	if (!browser && devs.length === 1)
		throw redirect(303, "/developers/" + encodeSEO(devs[0].username))

	return { devs, count, range }
}
