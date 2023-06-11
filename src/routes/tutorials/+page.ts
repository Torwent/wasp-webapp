import { redirect } from "@sveltejs/kit"
import type { PageLoad } from "./$types"
import { supabaseHelper } from "$lib/backend/auth"

export const load: PageLoad = async ({ url, depends, parent }) => {
	depends("tutorials:posts")

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

	let posts

	if (level > -1) {
		posts = supabaseHelper
			.from("tutorials")
			.select("id, created_at, user_id, author, title, description, content, level", {
				count: "exact"
			})
			.eq("level", level)
			.range(start, finish)
	} else if (search === "") {
		posts = supabaseHelper
			.from("tutorials")
			.select("id, created_at, user_id, author, title, description, content, level", {
				count: "exact"
			})
			.order("level", { ascending: ascending })
			.range(start, finish)
	} else {
		posts = supabaseHelper
			.from("tutorials")
			.select("id, created_at, user_id, author, title, description, content, level", {
				count: "exact"
			})
			.ilike("tutorials_search", "%" + search.replaceAll("%", "") + "%")
	}

	const { data, count, error } = await posts

	if (error) {
		console.error("tutorials SELECT failed: " + error)
		throw redirect(303, "./")
	}

	return { posts: data, count, range }
}
