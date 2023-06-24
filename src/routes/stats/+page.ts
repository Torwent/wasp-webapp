import type { Stats } from "$lib/types/collection"
import { UUID_V4_REGEX } from "$lib/utils"
import { redirect } from "@sveltejs/kit"

export const load = async ({ url, depends, parent }) => {
	const parentPromise = parent()
	depends("supabase:stats")

	const order = url.searchParams.get("order") || "experience"
	const ascending = url.searchParams.get("ascending")?.toLowerCase() === "true"
	const search = decodeURIComponent(url.searchParams.get("search") || "").trim()

	const pageStr = url.searchParams.get("page") || "-1"
	const page = Number(pageStr) < 0 || Number.isNaN(Number(pageStr)) ? 1 : Number(pageStr)

	const range = 30
	const start = (page - 1) * range
	const finish = start + range

	let total: Stats = {
		username: "Total",
		experience: 0,
		gold: 0,
		levels: 0,
		runtime: 0,
		password: "",
		updated_at: null,
		userID: ""
	}

	const totalEntries = 10
	const { supabaseClient } = await parentPromise

	let query = supabaseClient
		.from("stats")
		.select("username, experience, gold, levels, runtime", { count: "exact" })

	if (search === "") {
		query
			.or("experience.gt.0,gold.gt.0")
			.range(start, finish)
			.order(order, { ascending: ascending, foreignTable: "", nullsFirst: false })
	} else if (UUID_V4_REGEX.test(search)) {
		query.eq("userID", search)
	} else {
		query.ilike("username", "%" + search.replaceAll("%", "") + "%")
	}

	const promises = await Promise.all([
		query.returns<Stats[]>(),
		supabaseClient.rpc("get_stats_total").returns<Stats[]>()
	])

	const { data, count, error } = promises[0]
	const { data: tData, error: tError } = promises[1]

	if (error) {
		console.error("stats SELECT failed: " + error.message)
		throw redirect(303, "/")
	}

	if (tError) {
		console.error("stats SELECT failed: " + tError.message)
		throw redirect(303, "/")
	}

	total.experience = tData[0].experience || 0
	total.gold = tData[0].gold || 0
	total.levels = tData[0].levels || 0
	total.runtime = tData[0].runtime || 0

	return { total, stats: data, count: count || totalEntries, range: range }
}
