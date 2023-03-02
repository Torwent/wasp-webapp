import { SERVICE_USER, SERVICE_PASS } from "$env/static/private"
import { supabase } from "$lib/database/supabase"
import type { Stat } from "$lib/database/types"
import type { PageServerLoad } from "./$types"

export const load: PageServerLoad = async () => {
	let total: Stat = {
		username: "Total",
		experience: 0,
		gold: 0,
		levels: 0,
		runtime: 0,
		banned: false
	}

	if (supabase.auth.user() == null) {
		const { error } = await supabase.auth.signIn({
			email: SERVICE_USER,
			password: SERVICE_PASS
		})
		if (error) {
			const response = {
				total: total,
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
		.from("stats")
		.select("username, experience, gold, levels, runtime")
	if (error) {
		const response = {
			total: total,
			stats: [],
			status: 500,
			error: new Error(
				`The server failed to data from the database. This is not an issue on your side! Error message:\n\n${error.message}`
			)
		}
		return response
	}

	data.forEach((entry) => {
		total.experience += entry.experience
		total.gold += entry.gold
		total.levels += entry.levels
		total.runtime += entry.runtime
	})

	return { total: total, stats: data }
}
