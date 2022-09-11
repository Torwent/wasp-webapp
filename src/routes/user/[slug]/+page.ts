import type { Load } from "@sveltejs/kit"
import { loadError } from "$lib/utils"
import { supabase } from "$lib/database/supabase"

export const load: Load = async ({ params }) => {
	const { slug } = params

	const { data, error } = await supabase.from("profile").select("*").eq("id", slug)

	if (error) return loadError("user/" + slug)
	return data[0]
}
