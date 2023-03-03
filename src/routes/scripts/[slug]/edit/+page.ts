import type { Load } from "@sveltejs/kit"
import { supabase } from "$lib/database/supabase"
import { loadError } from "$lib/utils"
import type { Script } from "$lib/database/types"

async function getScript(id: string = "") {
	const publicData = supabase.from("scripts_public").select().eq("id", id)
	const protectedData = supabase.from("scripts_protected").select().eq("id", id)
	const statsData = supabase.from("stats_scripts").select().eq("script_id", id)

	const promises = await Promise.all([publicData, protectedData, statsData])

	const { data: dataPublic, error: errorPublic } = promises[0]
	const { data: dataProtected, error: errorProtected } = promises[1]
	const { data: dataStats, error: errorStats } = promises[2]

	if (errorPublic) return console.error(errorPublic)
	if (errorProtected) return console.error(errorProtected)
	if (errorStats) return console.error(errorStats)

	const publicD = dataPublic[0]
	const protectedD = dataProtected[0]
	const statsD = dataStats[0]

	const script: Script = {
		id: id,
		title: publicD.title,
		description: publicD.description,
		content: publicD.content,
		categories: publicD.categories,
		subcategories: publicD.subcategories,
		revision: protectedD.revision,
		author: protectedD.author,
		author_id: protectedD.author_id,
		assets_path: protectedD.assets_path,
		assets_alt: protectedD.assets_alt,
		min_xp: statsD.min_xp,
		max_xp: statsD.max_xp,
		min_gp: statsD.min_gp,
		max_gp: statsD.max_gp
	}

	return script
}

export const load: Load = async ({ params }) => {
	const { slug } = params
	if (slug == null) return loadError()

	let id = slug.substring(slug.indexOf("&") + 1)
	const script = getScript(id)

	return script
}
