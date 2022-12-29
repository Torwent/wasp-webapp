import type { Load } from "@sveltejs/kit"
import { supabase } from "$lib/database/supabase"
import { loadError } from "$lib/utils"

export const load: Load = async () => {
	const { data, error } = await supabase.from("stats_protected").select("*")
	if (error) return loadError(error.toString())

	return { data }
}
