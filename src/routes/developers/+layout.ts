import type { DeveloperWithUsername } from "$lib/types/collection"
import type { SupabaseClient } from "@supabase/supabase-js"

async function getDevelopers(
	supabase: SupabaseClient,
	search: string,
	start: number,
	finish: number
) {
	let query = supabase.from("developers").select(
		`id, realname, description, github, paypal_id,
				content, profiles_public (username, avatar_url)`,
		{ count: "exact" }
	)

	if (search === "") {
		query = query
			.order("username", { foreignTable: "profiles_public", ascending: true })
			.range(start, finish)
	} else {
		query = query.ilike("search", "%" + search + "%")
	}

	return await query.returns<DeveloperWithUsername[]>()
}

export const load = async ({ url: { searchParams }, params: { slug }, parent, depends }) => {
	const parentPromise = parent()
	depends("supabase:developers")

	const pageStr = searchParams.get("page") || "-1"
	const page = Number(pageStr) < 0 || Number.isNaN(Number(pageStr)) ? 1 : Number(pageStr)
	const search = decodeURIComponent(searchParams.get("search") || "").trim()
	const range = 10

	const start = ((slug ? 1 : page) - 1) * range
	const finish = start + range

	const { supabaseClient } = await parentPromise

	return {
		developersData: getDevelopers(supabaseClient, slug ? "" : search, start, finish),
		range
	}
}
