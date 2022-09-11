import type { Load } from "@sveltejs/kit"
import { supabase } from "$lib/database/supabase"
import { loadError } from "$lib/utils"

export const load: Load = async ({ params }) => {
	const { slug } = params
	if (slug == null) return loadError()

	let id = slug.substring(slug.indexOf("&") + 1)
	const { data, error } = await supabase.from("scripts").select("*").eq("id", id)

	if (error) return loadError("scripts/" + slug)

	const script = data[0]
	if (script) return script
}
