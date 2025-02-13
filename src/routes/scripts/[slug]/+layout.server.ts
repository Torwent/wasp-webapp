import { getScriptByID, getScriptByURL } from "$lib/server/scripts.server"
import { UUID_V4_REGEX } from "$lib/utils"
import { error, redirect } from "@sveltejs/kit"

export const load = async ({ params: { slug } }) => {
	const isUUID = UUID_V4_REGEX.test(slug)

	if (!isUUID) {
		if (!slug.includes("-by-")) {
			slug = slug.split("&").pop() || ""
			const isOldFormat = UUID_V4_REGEX.test(slug)
			if (!isOldFormat) error(404, "Script not found!")
			redirect(301, "/scripts/" + slug)
		}
	}

	const script = await (isUUID ? getScriptByID(slug) : getScriptByURL(slug))
	if (!script) error(404, "Script not found!")
	return { script }
}
