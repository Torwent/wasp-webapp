import { getScripter, getScripterUUID } from "$lib/backend/data"
import type { Script } from "$lib/types/collection"
import { UUID_V4_REGEX } from "$lib/utils"
import { error } from "@sveltejs/kit"

export const load = async ({ url: { searchParams }, params: { slug }, parent }) => {
	if (slug.includes(" ")) throw error(404, "Developer not found!")

	const pageStr = searchParams.get("page") || "-1"
	const page = Number(pageStr) < 0 || Number.isNaN(Number(pageStr)) ? 1 : Number(pageStr)

	const search = decodeURIComponent(searchParams.get("search") || "").trim()

	const range = 5
	const start = (page - 1) * range
	const finish = start + range

	const { profile, supabaseClient } = await parent()
	const scripter = UUID_V4_REGEX.test(slug)
		? await getScripterUUID(supabaseClient, slug.toLowerCase())
		: await getScripter(supabaseClient, slug.toLowerCase())

	let query = supabaseClient
		.schema("scripts")
		.from("scripts")
		.select(
			`id, url, title, description, content, categories, subcategories, published, min_xp, max_xp, min_gp, max_gp,
			tooltip_emojis, tooltip_names,
			protected!inner (assets, author_id, revision, username, avatar, revision_date)`,
			{ count: "estimated" }
		)
		.eq("protected.author_id", scripter.id)

	if (
		!profile ||
		profile.id !== scripter.id ||
		profile.roles.tester ||
		profile.roles.moderator ||
		profile.roles.administrator
	)
		query.eq("published", true)

	query.order("title", { ascending: true }).range(start, finish)

	if (search !== "") query = query.ilike("search", "%" + search + "%")

	const { data, error: err, count } = await query.returns<Script[]>()

	if (err)
		throw error(
			500,
			`Server error, this is probably not an issue on your end! - SELECT scripts.scripts failed
			Error code: ${err.code}
			Error hint: ${err.hint}
			Error details: ${err.details}
			Error hint: ${err.message}`
		)

	const scripterData = { data, count: count ? count : 0 }

	return {
		developer: scripter,
		scripts: scripterData,
		range
	}
}
