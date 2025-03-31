import { browser } from "$app/environment"
import type { ScripterBase } from "$lib/types/collection"
import { encodeSEO, formatError } from "$lib/utils.js"
import { error, redirect } from "@sveltejs/kit"

export const load = async ({ url: { searchParams }, parent }) => {
	const { supabaseClient } = await parent()
	const pageN = Number(searchParams.get("page") || "-1")
	const page = pageN < 0 || Number.isNaN(pageN) ? 1 : pageN

	const amountN = Number(searchParams.get("amount") || "10")
	const amount = amountN < 0 || Number.isNaN(amountN) ? 1 : amountN

	const search = decodeURIComponent(searchParams.get("search") || "").trim()

	const start = (page - 1) * amount
	const finish = start + amount - 1

	async function getScripters() {
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

	const scripters = await getScripters()

	return { scripters: scripters.scripters, amount, count: scripters.count }
}
