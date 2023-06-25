import { addToolTips, getDeveloper, getDeveloperUUID } from "$lib/backend/data"
import type { Category, Script, SubCategory } from "$lib/types/collection"
import { UUID_V4_REGEX } from "$lib/utils"
import type { SupabaseClient } from "@supabase/supabase-js"
import { redirect } from "@sveltejs/kit"

async function getCategories(supabase: SupabaseClient) {
	const { data, error } = await supabase
		.from("scripts_categories")
		.select("name, emoji")
		.returns<Category[]>()
	if (error) {
		console.error("SELECT scripts_categories failed: " + error.message)
		throw redirect(303, "/")
	}
	return data
}

async function getSubCategories(supabase: SupabaseClient) {
	const { data, error } = await supabase
		.from("scripts_subcategories")
		.select("category, name, emoji")
		.returns<SubCategory[]>()
	if (error) {
		console.error("SELECT scripts_categories failed: " + error.message)
		throw redirect(303, "/")
	}
	return data
}

async function getScripts(
	supabase: SupabaseClient,
	developerID: string,
	search: string,
	start: number,
	finish: number
) {
	let query = supabase
		.from("scripts_public")
		.select(
			`id, title, description, content, categories, subcategories, published, min_xp, max_xp, min_gp, max_gp,
			scripts_protected!inner (assets_path, author_id, assets_alt, revision, profiles_public (username, avatar_url)),
			stats_scripts (experience, gold, runtime, levels, total_unique_users, total_current_users, total_monthly_users)`,
			{ count: "exact" }
		)
		.eq("scripts_protected.author_id", developerID)
		.order("title", { ascending: true })
		.range(start, finish)

	if (search !== "") query = query.ilike("search_script", "%" + search + "%")

	const { data, error, count } = await query.returns<Script[]>()

	if (error) {
		console.error(
			"script_public SELECT failed with author_id: " + developerID + " error: " + error.message
		)
		return { data: [], count: count ? count : 0 }
	}

	return { data, count: count ? count : 0 }
}

export const load = async ({ url, params, parent, depends }) => {
	const parentPromise = parent()
	depends("supabase:developer")

	const pageStr = url.searchParams.get("page") || "-1"
	const page = Number(pageStr) < 0 || Number.isNaN(Number(pageStr)) ? 1 : Number(pageStr)

	const search = decodeURIComponent(url.searchParams.get("search") || "").trim()

	const range = 5
	const start = (page - 1) * range
	const finish = start + range

	const { slug } = params
	const { supabaseClient } = await parentPromise

	const developer = UUID_V4_REGEX.test(slug)
		? await getDeveloperUUID(supabaseClient, slug)
		: await getDeveloper(supabaseClient, slug)

	if (!developer) throw redirect(300, "./")

	const promises = await Promise.all([
		getScripts(supabaseClient, developer.id, search, start, finish),
		getCategories(supabaseClient),
		getSubCategories(supabaseClient)
	])
	let { data: scripts, count } = promises[0]
	const categories = promises[1]
	const subcategories = promises[2]

	await new Promise<void>((resolve) => {
		scripts.forEach(async (script, index, array) => {
			await addToolTips(script, categories, subcategories)
			if (index === array.length - 1) resolve()
		})
	})

	return {
		developer,
		scripts,
		count,
		range
	}
}
