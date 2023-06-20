import type { SupabaseClient } from "@supabase/supabase-js"

async function getDevelopers(
	supabase: SupabaseClient,
	search: string,
	start: number,
	finish: number
) {
	if (search === "") {
		return await supabase
			.from("developers")
			.select("id, real_name, username, description, github, paypal_id, content", {
				count: "exact"
			})
			.order("username", { ascending: true })
			.range(start, finish)
	}

	return await supabase
		.from("developers")
		.select("id, real_name, username, description, github, paypal_id, content", {
			count: "exact"
		})
		.ilike("search_developers", "%" + search + "%")
}

export const load = async ({ url, parent, depends }) => {
	const parentPromise = parent()
	depends("supabase:developers")

	const pageStr = url.searchParams.get("page") || "-1"
	const page = Number(pageStr) < 0 || Number.isNaN(Number(pageStr)) ? 1 : Number(pageStr)
	const search = decodeURIComponent(url.searchParams.get("search") || "").trim()
	const range = 10

	const start = (page - 1) * range
	const finish = start + range

	const { supabaseClient } = await parentPromise

	return {
		developersData: getDevelopers(supabaseClient, search, start, finish),
		range
	}
}
