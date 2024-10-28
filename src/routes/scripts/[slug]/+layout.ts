import { getScript } from "$lib/client/supabase"
import { streamedErrorHandler } from "$lib/client/utils.js"
import { UUID_V4_REGEX } from "$lib/utils"
import { error, redirect } from "@sveltejs/kit"

export const load = async ({ params: { slug }, parent }) => {
	const isUUID = UUID_V4_REGEX.test(slug)

	if (!isUUID) {
		if (!slug.includes("-by-")) {
			slug = slug.split("&").pop() || ""
			const isOldFormat = UUID_V4_REGEX.test(slug)
			if (!isOldFormat) error(404, "Script not found!")
			redirect(301, "/scripts/" + slug)
		}
	}

	const { supabaseClient } = await parent()
	return { script: await getScript(supabaseClient, slug, isUUID) }
}
