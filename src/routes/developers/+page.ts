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

	if (!browser && data.length === 1)
		throw redirect(303, "/developers/" + encodeSEO(data[0].profiles_public.username))

	return { developers: data, count, range }
}
