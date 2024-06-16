import { error, redirect } from "@sveltejs/kit"
import { browser } from "$app/environment"
import { encodeSEO, formatError } from "$lib/utils"
import { streamedErrorHandler } from "$lib/client/utils"

export const load = async ({ url, parent }) => {
	const pageN = Number(url.searchParams.get("page") || "-1")
	const page = pageN < 0 || Number.isNaN(pageN) ? 1 : pageN

	const ascendingStr = url.searchParams.get("ascending")
	const ascending = ascendingStr ? ascendingStr.toLowerCase() === "true" : true

	const search = decodeURIComponent(url.searchParams.get("search") || "").trim()

	const levelN = Number(url.searchParams.get("level") || "-1")
	const level = levelN < -1 || levelN > 2 || Number.isNaN(levelN) ? -1 : levelN

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
		const { supabaseClient, user, roles } = await parent()
		let query = supabaseClient
			.schema("info")
			.from("tutorials")
			.select("title, description, content, level, username, url, order, published, author_id", {
				count: "estimated"
			})

		if (!user) {
			query.or("published.eq.true")
		} else if (!roles?.administrator && !roles?.moderator) {
			query.or("published.eq.true,author_id.eq." + user.id)
		}

		if (level > -1) {
			query = query.eq("level", level).order("order", { ascending: ascending }).range(start, finish)
		} else if (search === "") {
			query = query.order("order", { ascending: ascending }).range(start, finish)
		} else {
			query = query.ilike("search", "%" + search.replaceAll("%", "") + "%")
		}

		const { data, count, error: err } = await query

		if (err)
			error(
				500,
				"Server error, this is probably not an issue on your end!\n" +
					"SELECT tutorials failed!\n\n" +
					formatError(err)
			)

		if (!browser && count === 1)
			redirect(303, "/tutorials/" + encodeSEO(data[0].title + " by " + data[0].username))

		return { tutorials: data, count: count ?? 0 }
	}

	const tutorialsPromise = getTutorials(level, search, start, finish, ascending)
	tutorialsPromise.catch((err) => streamedErrorHandler(err))

	return { tutorialsPromise, range }
}
