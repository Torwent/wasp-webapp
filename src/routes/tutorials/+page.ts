import { error, redirect } from "@sveltejs/kit"
import { browser } from "$app/environment"
import { encodeSEO } from "$lib/utils"
import type { TutorialWithAuthor } from "$lib/types/collection"

export const load = async ({ url, depends, parent }) => {
	const parentPromise = parent()
	depends("supabase:tutorials")

	const pageStr = url.searchParams.get("page") || "-1"
	const page = Number(pageStr) < 0 || Number.isNaN(Number(pageStr)) ? 1 : Number(pageStr)

	const ascendingStr = url.searchParams.get("ascending")
	const ascending = ascendingStr ? ascendingStr.toLowerCase() === "true" : true

	const search = decodeURIComponent(url.searchParams.get("search") || "").trim()

	const levelStr = url.searchParams.get("level") || "-1"
	const level =
		Number(levelStr) < -1 || Number(levelStr) > 2 || Number.isNaN(Number(levelStr))
			? -1
			: Number(levelStr)

	const range = 10

	const start = (page - 1) * range
	const finish = start + range

	async function getTutorials(
		level: number,
		search: string,
		start: number,
		finish: number,
		ascending: boolean
	) {
		const { supabaseClient } = await parentPromise
		let query = supabaseClient
			.from("tutorials")
			.select(
				"id, user_id, title, description, content, level, profiles_public(username, avatar_url)",
				{ count: "exact" }
			)

		if (level > -1) {
			query = query.eq("level", level).order("order", { ascending: ascending }).range(start, finish)
		} else if (search === "") {
			query = query.order("order", { ascending: ascending }).range(start, finish)
		} else {
			query = query.ilike("search", "%" + search.replaceAll("%", "") + "%")
		}

		const { data, count, error: err } = await query.returns<TutorialWithAuthor[]>()

		if (err)
			throw error(
				500,
				`Server error, this is probably not an issure on your end! - SELECT tutorials failed
			Error code: ${err.code}
			Error hint: ${err.hint}
			Error details: ${err.details}
			Error hint: ${err.message}`
			)

		if (!browser && count === 1)
			throw redirect(
				303,
				"/tutorials/" + encodeSEO(data[0].title + " by " + data[0].profiles_public.username)
			)
		return { data, count }
	}

	return { tutorials: getTutorials(level, search, start, finish, ascending), range }
}
