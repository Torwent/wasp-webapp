import { browser } from "$app/environment"
import { encodeSEO } from "$lib/utils"
import { error, redirect } from "@sveltejs/kit"

export const load = async ({ parent }) => {
	const { developersData, range } = await parent()
	const { data, count, error: err } = developersData

	if (err)
		throw error(
			500,
			`Server error, this is probably not an issure on your end! - SELECT developers failed
			Error code: ${err.code}
			Error hint: ${err.hint}
			Error details: ${err.details}
			Error hint: ${err.message}`
		)

	if (!browser && data.length === 1)
		throw redirect(303, "/developers/" + encodeSEO(data[0].profiles_public.username))

	return { developers: data, count, range }
}
