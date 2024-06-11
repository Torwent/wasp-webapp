import { getScripter } from "$lib/client/data"
import type { ScriptBase } from "$lib/types/collection"
import { formatError } from "$lib/utils"
import { error } from "@sveltejs/kit"

export const load = async ({ url: { searchParams }, params: { slug }, parent }) => {
	if (slug.includes(" ")) error(404, "Developer not found!")

	const pageStr = searchParams.get("page") || "-1"
	const page = Number(pageStr) < 0 || Number.isNaN(Number(pageStr)) ? 1 : Number(pageStr)

	const search = decodeURIComponent(searchParams.get("search") || "").trim()

	const range = 7
	const start = (page - 1) * range
	const finish = start + range

	const { profile, roles, supabaseClient } = await parent()
	const scripter = getScripter(supabaseClient, slug)

	async function getScripterScripts() {
		const scripterPromise = await scripter
		let query = supabaseClient
			.schema("scripts")
			.from("scripts")
			.select(
				`title, description, url, published, tooltip_emojis, tooltip_names, protected!inner (assets, username, avatar)`,
				{ count: "estimated" }
			)
			.eq("protected.author_id", scripterPromise.id)

		if (
			!profile ||
			profile.id !== scripterPromise.id ||
			roles?.tester ||
			roles?.moderator ||
			roles?.administrator
		)
			query.eq("published", true)

		query.order("title", { ascending: true }).range(start, finish)

		if (search !== "") query = query.ilike("search", "%" + search + "%")

		const { data, error: err, count } = await query.returns<ScriptBase[]>()

		if (err)
			error(
				500,
				"<p>Server error, this is probably not an issue on your end!</p>" +
					"<p>SELECT scripts.scripts failed</p>" +
					formatError(err)
			)

		return { scripts: data, count: count ?? 0 }
	}

	return {
		scripter,
		scripts: getScripterScripts(),
		range
	}
}
