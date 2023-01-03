import { supabase } from "$lib/database/supabase"
import type { PageLoad } from "./$types"

export const load: PageLoad = async () => {
	const { data, error } = await supabase.from("blog").select("*")
	if (error)
		return {
			posts: [],
			status: 500,
			error: new Error(`Server failed to fetch from blog. Error message:\n\n${error.message}`)
		}

	return { posts: data }
}
