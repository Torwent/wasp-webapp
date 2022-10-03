import type { Load } from "@sveltejs/kit"
import { getScripts } from "$lib/database/supabase"
import { loadError } from "$lib/utils"
import type { Script } from "$lib/database/types"

export const load: Load = async ({ params }) => {
	const { slug } = params
	if (slug == null) return loadError()

	let id = slug.substring(slug.indexOf("&") + 1)
	const script = (await getScripts(id)) as unknown as Script[]

	if (script.length === 0) return loadError("scripts/" + slug)

	if (script) return script[0]
}
