import { supabase } from "$lib/database/supabase"
import type { PageLoad } from "./$types"

export const load: PageLoad = async () => {
	const { data, error } = await supabase
		.from("devs")
		.select("real_name, username, description, github, paypal_id, content")
	if (error)
		return {
			devs: [],
			status: 500,
			error: new Error(`Server failed to fetch from blog. Error message:\n\n${error.message}`)
		}

	return { devs: data }
}
