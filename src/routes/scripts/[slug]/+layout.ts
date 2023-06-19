import { getScript, getScriptUUID } from "$lib/backend/data"
import { UUID_V4_REGEX } from "$lib/utils"
import { redirect } from "@sveltejs/kit"

export const load = async ({ params, parent }) => {
	const { supabaseClient, categories, subcategories } = await parent()
	const { slug } = params

	const script = UUID_V4_REGEX.test(slug)
		? await getScriptUUID(supabaseClient, slug)
		: await getScript(supabaseClient, slug)
	if (!script) throw redirect(300, "/scripts")
	return { script, categories, subcategories }
}
