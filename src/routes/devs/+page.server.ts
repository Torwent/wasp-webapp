import type { PageServerLoad } from "./$types"

export const load: PageServerLoad = async ({ url, depends, locals }) => {
	depends("developers:devs")
	const { supabase } = locals

	const pageStr = url.searchParams.get("page") || "-1"
	const page = Number(pageStr) < 0 || Number.isNaN(Number(pageStr)) ? 1 : Number(pageStr)
	const search = decodeURIComponent(url.searchParams.get("search") || "").trim()
	const range = 10

	const start = (page - 1) * range
	const finish = start + range

	let devs

	if (search === "") {
		devs = await supabase
			.from("devs")
			.select("realname, username, description, github, paypal_id, content", {
				count: "exact"
			})
			.order("username", { ascending: true })
			.range(start, finish)
	} else {
		devs = await supabase
			.from("devs")
			.select("realname, username, description, github, paypal_id, content", {
				count: "exact"
			})
			.ilike("id_realname_username_description_content", "%" + search + "%")
	}

	const { data, count, error } = devs

	if (error) {
		const response = {
			devs: [],
			totalEntries: 0,
			range: range,
			status: 500,
			error: new Error(
				`The server failed to fetch data from the database. This is not an issue on your side! Error message:\n\n${error.message}`
			)
		}
		return response
	}

	return { devs: data, count, range }
}
