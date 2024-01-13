import { browser } from "$app/environment"
import { encodeSEO } from "$lib/utils"
import { error, redirect } from "@sveltejs/kit"

export const load = async ({ parent }) => {
	const { scripterData, range } = await parent()
	const { data, count, error: err } = scripterData

	if (err)
		throw error(
			500,
			`Server error, this is probably not an issue on your end! - SELECT scripters failed
			Error code: ${err.code}
			Error hint: ${err.hint}
			Error details: ${err.details}
			Error hint: ${err.message}`
		)

	if (!browser && data.length === 1)
		throw redirect(303, "/scripters/" + encodeSEO(data[0].profiles.username))

	return { scripters: data, count: count ?? 0, range }
}
