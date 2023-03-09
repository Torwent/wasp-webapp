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
		runtime: 0
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

	let promises = []
	promises.push(
		supabase
			.from("stats")
			.select("username, experience, gold, levels, runtime")
			.or("experience.gt.0,gold.gt.0")
			.order("experience", { ascending: false })
	)

	promises.push(supabase.rpc("get_stats_total"))

	promises = await Promise.all(promises)

	const { data, error } = promises[0]
	const { data: tData, error: tError } = promises[1]

	if (error) {
		const response = {
			total: total,
			stats: [],
			status: 500,
			error: new Error(
				`The server failed to fetch data from the database. This is not an issue on your side! Error message:\n\n${error.message}`
			)
		}
		return response
	}

	if (tError) {
		const response = {
			total: total,
			stats: [],
			status: 500,
			error: new Error(
				`The server failed to fetch total data from the database. This is not an issue on your side! Error message:\n\n${tError.message}`
			)
		}
		return response
	}

	const totalData = tData[0] as Stat

	total.experience += totalData.experience
	total.gold += totalData.gold
	total.levels += totalData.levels
	total.runtime += totalData.runtime

	return { total: total, stats: data }
}
