import { browser } from "$app/environment"
import type { ScripterBase } from "$lib/types/collection"
import { encodeSEO, formatError } from "$lib/utils.js"
import { error, redirect } from "@sveltejs/kit"

export const load = async ({ url: { searchParams }, params: { slug }, parent, depends }) => {
	const pageN = Number(searchParams.get("page") || "-1")
	const page = pageN < 0 || Number.isNaN(pageN) ? 1 : pageN

	const search = decodeURIComponent(searchParams.get("search") || "").trim()
	const range = 10

	const start = ((slug ? 1 : page) - 1) * range
	const finish = start + range

	async function getScripters() {
		const { supabaseClient } = await parent()
		let query = supabaseClient
			.schema("profiles")
			.from("scripters")
			.select(`realname, description, url, profiles (username, avatar)`, {
				count: "estimated"
			})
			.limit(1, { referencedTable: "profiles" })

		query =
			search === ""
				? query.order("url").range(start, finish)
				: query.ilike("search", "%" + search + "%")

		const { data, error: err, count } = await query.returns<ScripterBase[]>()

		if (err) error(500, formatError(err))

		if (!browser && data.length === 1)
			redirect(303, "/scripters/" + encodeSEO(data[0].profiles.username))

		return { scripters: data, count: count ?? 0 }
	}
	return {
		scripters: getScripters(),
		range
	}
}
