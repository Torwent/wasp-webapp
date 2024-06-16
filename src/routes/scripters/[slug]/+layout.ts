import { getScripter } from "$lib/client/supabase"
import { streamedErrorHandler } from "$lib/client/utils"
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
	const scripterPromise = getScripter(supabaseClient, slug)
	scripterPromise.catch((err) => streamedErrorHandler(err))

	async function getScripterScripts() {
		const scripter = await scripterPromise
		let query = supabaseClient
			.schema("scripts")
			.from("scripts")
			.select(
				`title, description, url, published, tooltip_emojis, tooltip_names, protected!inner (assets, username, avatar)`,
				{ count: "estimated" }
			)
			.eq("protected.author_id", scripter.id)

		if (
			!profile ||
			profile.id !== scripter.id ||
			roles?.tester ||
			roles?.moderator ||
			roles?.administrator
		)
			query.eq("published", true)

		query.order("title", { ascending: true }).range(start, finish)

		if (search !== "") query = query.ilike("search", "%" + search + "%")

		const { data, error: err, count } = await query.returns<ScriptBase[]>()

		if (err) {
			error(
				500,
				"Server error, this is probably not an issue on your end!" +
					"SELECT scripts.scripts failed!\n\n" +
					formatError(err)
			)
		}

		return { scripts: data, count: count ?? 0 }
	}

	const scriptsPromise = getScripterScripts()
	scriptsPromise.catch((err) => streamedErrorHandler(err))

	return { scripterPromise, scriptsPromise, range }
}
