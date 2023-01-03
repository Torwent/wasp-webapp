import { SERVICE_USER, SERVICE_PASS } from "$env/static/private"
import { supabase } from "$lib/database/supabase"
import type { PageServerLoad } from "./$types"

export const load: PageServerLoad = async () => {
	if (supabase.auth.user() == null) {
		const { error } = await supabase.auth.signIn({
			email: SERVICE_USER,
			password: SERVICE_PASS
		})
		if (error) {
			const response = {
				stats: [],
				status: 500,
				error: new Error(
					`The server failed to login to the database. This is not an issue on your side! Error message:\n\n${error.message}`
				)
			}
			return response
		}
	}

	const { data, error } = await supabase
		.from("stats_protected")
		.select("biohash, username, experience, gold, levels, runtime, banned")
	if (error) {
		const response = {
			stats: [],
			status: 500,
			error: new Error(
				`The server failed to data from the database. This is not an issue on your side! Error message:\n\n${error.message}`
			)
		}
		return response
	}

	return { stats: data }
}
