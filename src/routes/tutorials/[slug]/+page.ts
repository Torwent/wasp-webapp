import { error } from "@sveltejs/kit"
import type { Tutorial } from "$lib/types/collection"

export const load = async ({ params, parent }) => {
	const { slug } = params

	const isSEOFormated = slug.includes("-by-")
	if (!isSEOFormated) {
		if (slug.includes(" "))
			throw error(410, "This page was either renamed or never existed! Search it in the tutorials.")
		throw error(404, "Tutorial not found!")
	}

	async function getTutorial() {
		const { supabaseClient } = await parent()
		const { data, error: err } = await supabaseClient
			.from("tutorials")
			.select("*")
			.eq("url", slug)
			.returns<Tutorial[]>()

		if (err)
			throw error(
				500,
				`Server error, this is probably not an issure on your end! - SELECT tutorials failed!
				Error code: ${err.code}
			Error hint: ${err.hint}
			Error details: ${err.details}
			Error hint: ${err.message}`
			)

		if (data.length === 0) throw error(404, "Tutorial not found!")
		return data[0]
	}

	return { tutorial: getTutorial() }
}
