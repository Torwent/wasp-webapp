import { error, redirect } from "@sveltejs/kit"
import { UUID_V4_REGEX } from "$lib/utils"
import { getTutorial } from "$lib/client/supabase"
import { streamedErrorHandler } from "$lib/client/utils"

export const load = async ({ params: { slug }, parent }) => {
	const isUUID = UUID_V4_REGEX.test(slug)

	if (!isUUID) {
		if (!slug.includes("-by-")) {
			slug = slug.split("&").pop() || ""
			const isOldFormat = UUID_V4_REGEX.test(slug)
			if (!isOldFormat) error(404, "Tutorial not found!")
			redirect(301, "/tutorials/" + slug)
		}
	}

	const { supabaseClient } = await parent()
	const tutorialPromise = getTutorial(supabaseClient, slug)
	tutorialPromise.catch((err) => streamedErrorHandler(err))

	return { tutorialPromise }
}
