import type { Script } from "$lib/types/collection"
import { UUID_V4_REGEX } from "$lib/utils"
import { error, redirect } from "@sveltejs/kit"

export const load = async ({ params, parent }) => {
	let { slug } = params

	const isUUID = UUID_V4_REGEX.test(slug)
	const isSEOFormated = slug.includes("-by-")

	if (!isUUID && !isSEOFormated) {
		slug = slug.split("&").pop() || ""
		const isOldFormat = UUID_V4_REGEX.test(slug)

		if (!isOldFormat) throw error(404, "Script not found!")
		throw redirect(301, "/scripts/" + slug)
	}

	async function getScript(slug: string) {
		const { supabaseClient } = await parent()
		const { data, error: err } = await supabaseClient
			.from("scripts_public")
			.select(
				`id, url, title, description, content, categories, subcategories, published, min_xp, max_xp, min_gp, max_gp,
			tooltip_emojis, tooltip_names,
			scripts_protected (assets_path, author_id, assets_alt, revision, profiles_public(username, avatar_url)),
			stats_scripts (experience, gold, runtime, levels, total_unique_users, total_current_users, total_monthly_users)`
			)
			.eq("url", slug)
			.returns<Script[]>()
		if (err)
			throw error(
				500,
				`Server error, this is probably not an issure on your end! - SELECT scripts_public failed
			Error code: ${err.code}
			Error hint: ${err.hint}
			Error details: ${err.details}
			Error hint: ${err.message}`
			)

		if (data.length === 0) throw error(404, "That script doesn't exist.")
		return data[0]
	}

	async function getScriptUUID(uuid: string) {
		const { supabaseClient } = await parent()
		const { data, error: err } = await supabaseClient
			.from("scripts_public")
			.select(
				`id, url, title, description, content, categories, subcategories, published, min_xp, max_xp, min_gp, max_gp,
			tooltip_emojis, tooltip_names,
			scripts_protected (assets_path, author_id, assets_alt, revision, profiles_public(username, avatar_url)),
			stats_scripts (experience, gold, runtime, levels, total_unique_users, total_current_users, total_monthly_users)`
			)
			.eq("id", uuid)
			.returns<Script[]>()
		if (err)
			throw error(
				500,
				`Server error, this is probably not an issure on your end! - SELECT scripts_public failed
			Error code: ${err.code}
			Error hint: ${err.hint}
			Error details: ${err.details}
			Error hint: ${err.message}`
			)

		if (data.length === 0) throw error(404, "That script doesn't exist.")
		return data[0]
	}

	return {
		script: isUUID ? getScriptUUID(slug) : getScript(slug)
	}
}
