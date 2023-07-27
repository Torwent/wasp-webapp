import { error } from "@sveltejs/kit"
import type { TutorialWithAuthor } from "$lib/types/collection"

export const load = async ({ params, data, parent }) => {
	const { slug } = params

	const isSEOFormated = slug.includes("-by-")
	if (!isSEOFormated) {
		if (slug.includes(" "))
			throw error(410, "This page was either renamed or never existed! Search it in the tutorials.")
		throw error(404, "Tutorial not found!")
	}

	async function getTutorial() {
		const { supabaseClient } = await parent()
		const { data: tutorials, error: err } = await supabaseClient
			.from("tutorials")
			.select("*, profiles_public (*)")
			.eq("url", slug)
			.returns<TutorialWithAuthor[]>()

		if (err)
			throw error(
				500,
				`Server error, this is probably not an issure on your end! - SELECT tutorials failed!
			Error code: ${err.code}
			Error hint: ${err.hint}
			Error details: ${err.details}
			Error hint: ${err.message}`
			)

		if (tutorials.length === 0) throw error(404, "Tutorial not found!")
		return tutorials[0]
	}
	return { tutorial: getTutorial(), form: data.form }
}
