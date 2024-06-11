import { error } from "@sveltejs/kit"
import { formatError } from "$lib/utils"

export const load = async ({ params, parent }) => {
	const { slug } = params

	const isSEOFormated = slug.includes("-by-")
	if (!isSEOFormated) {
		if (slug.includes(" "))
			error(410, "This page was either renamed or never existed! Search it in the tutorials.")
		error(404, "Tutorial not found!")
	}

	const { supabaseClient } = await parent()

	const { data, error: err } = await supabaseClient
		.schema("info")
		.from("tutorials")
		.select("title, description, content, level, username, url, published, author_id")
		.eq("url", slug)
		.single()

	if (err)
		error(
			500,
			"<p>Server error, this is probably not an issue on your end!</p>" +
				"<p>SELECT tutorials failed</p>" +
				formatError(err)
		)

	return { tutorial: data }
}
