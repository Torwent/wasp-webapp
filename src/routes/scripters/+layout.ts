import type { ScripterWithProfile } from "$lib/types/collection"

export const load = async ({ url: { searchParams }, params: { slug }, parent, depends }) => {
	const pageN = Number(searchParams.get("page") || "-1")
	const page = pageN < 0 || Number.isNaN(pageN) ? 1 : pageN

	const search = decodeURIComponent(searchParams.get("search") || "").trim()
	const range = 10

	const start = ((slug ? 1 : page) - 1) * range
	const finish = start + range

	const { supabaseClient } = await parent()

	let query = supabaseClient
		.schema("profiles")
		.from("scripters")
		.select(
			`id, realname, description, github, paypal_id, content, url, profiles!left (username, avatar)`,
			{ count: "estimated" }
		)

	query =
		search === ""
			? query.order("username", { foreignTable: "profiles", ascending: true }).range(start, finish)
			: query.ilike("search", "%" + search + "%")

	const scripters = await query.returns<ScripterWithProfile[]>()

	return {
		scripterData: scripters,
		range
	}
}
