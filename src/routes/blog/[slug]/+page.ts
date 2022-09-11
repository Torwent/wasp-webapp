import type { Load } from "@sveltejs/kit"
import { supabase } from "$lib/database/supabase"
import { loadError } from "$lib/utils"

export const load: Load = async ({ params }) => {
	const { slug } = params
	if (slug == null) return loadError()

	const { data, error } = await supabase.from("posts").select("*").eq("title", decodeURI(slug))
	if (error) return loadError("blog/" + slug)

	return data[0]
}
