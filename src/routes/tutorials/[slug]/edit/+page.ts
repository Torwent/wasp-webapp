import { error } from "@sveltejs/kit"
import { formatError } from "$lib/utils.js"

export const load = async ({ params, data, parent }) => {
	const { slug } = params

	const isSEOFormated = slug.includes("-by-")
	if (!isSEOFormated) {
		if (slug.includes(" "))
			error(410, "This page was either renamed or never existed! Search it on the tutorials page.")
		error(404, "Tutorial not found!")
	}

	const { supabaseClient } = await parent()
	const { data: tutorial, error: err } = await supabaseClient
		.schema("info")
		.from("tutorials")
		.select("id, title, description, content, level, username, url, order, published, author_id")
		.eq("url", slug)
		.single()

	if (err)
		error(
			500,
			"<p>Server error, this is probably not an issue on your end!</p>" +
				"<p>SELECT tutorials failed!</p>" +
				formatError(err)
		)

	data.form.data.title = tutorial.title
	data.form.data.description = tutorial.description
	data.form.data.content = tutorial.content
	data.form.data.level = tutorial.level
	data.form.data.order = tutorial.order
	data.form.data.published = tutorial.published

	return { form: data.form }
}
