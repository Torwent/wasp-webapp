import type { PageServerLoad } from "./$types"

export const load: PageServerLoad = async ({ url, depends, locals }) => {
	depends("tutorials:posts")
	const { supabase } = locals

	const pageStr = url.searchParams.get("page") || "-1"
	const page = Number(pageStr) < 0 || Number.isNaN(Number(pageStr)) ? 1 : Number(pageStr)

	const ascending = url.searchParams.get("ascending")?.toLowerCase() !== "true"
	const search = decodeURI(url.searchParams.get("search") || "")

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
		posts = await supabase
			.from("tutorials")
			.select("id, created_at, user_id, author, title, description, content, level", {
				count: "exact"
			})
			.eq("level", level)
			.range(start, finish)
	} else if (search === "") {
		posts = await supabase
			.from("tutorials")
			.select("id, created_at, user_id, author, title, description, content, level", {
				count: "exact"
			})
			.order("level", { ascending: ascending })
			.range(start, finish)
	} else {
		posts = await supabase
			.from("tutorials")
			.select("id, created_at, user_id, author, title, description, content, level", {
				count: "exact"
			})
			.textSearch("title_description_content_author", search, { type: "websearch" })
	}

	const { data, count, error } = posts

	if (error) {
		const response = {
			posts: [],
			totalEntries: 0,
			range: range,
			status: 500,
			error: new Error(
				`The server failed to fetch data from the database. This is not an issue on your side! Error message:\n\n${error.message}`
			)
		}
		return response
	}

	return { posts: data, count, range }
}
