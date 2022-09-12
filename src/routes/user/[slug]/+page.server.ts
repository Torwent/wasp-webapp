import type { ServerLoad } from "@sveltejs/kit"
import { loadError } from "$lib/utils"
import { supabase } from "$lib/database/supabase"

export const load: ServerLoad = async ({ params, getClientAddress }) => {
	const { slug } = params

	const { data, error } = await supabase.from("profile").select("*").eq("id", slug)

	if (error) return loadError("user/" + slug)

	return { data: data[0], clientAddress: getClientAddress() }
}
