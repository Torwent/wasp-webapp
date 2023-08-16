import type { ScripterWithUsername } from "$lib/types/collection"

export const load = async ({ url: { searchParams }, params: { slug }, parent, depends }) => {
	depends("supabase:developers")

	const pageStr = searchParams.get("page") || "-1"
	const page = Number(pageStr) < 0 || Number.isNaN(Number(pageStr)) ? 1 : Number(pageStr)
	const search = decodeURIComponent(searchParams.get("search") || "").trim()
	const range = 10

	const start = ((slug ? 1 : page) - 1) * range
	const finish = start + range

	async function getScripters(search: string, start: number, finish: number) {
		const { supabaseClient } = await parent()
		let query = supabaseClient
			.schema("profiles")
			.from("scripters")
			.select(
				`id, realname, description, github, paypal_id, content,  profiles!left (username, avatar)`
			)

		if (search === "") {
			query = query
				.order("username", { foreignTable: "profiles", ascending: true })
				.range(start, finish)
		} else {
			query = query.ilike("search", "%" + search + "%")
		}

		return await query.returns<ScripterWithUsername[]>()
	}

	return {
		scripterData: getScripters(slug ? "" : search, start, finish),
		range
	}
}
