import { error } from "@sveltejs/kit"
import { encodeSEO } from "$lib/utils"
import type { TutorialWithAuthor } from "$lib/types/collection"

export const load = async ({ params, data, parent }) => {
	const parentPromise = parent()
	const { slug } = params

	const isSEOFormated = slug.includes("-by-")
	if (!isSEOFormated) {
		if (slug.includes(" "))
			throw error(410, "This page was either renamed or never existed! Search it in the tutorials.")
		throw error(404, "Tutorial not found!")
	}

	const { supabaseClient } = await parentPromise
	const { data: tutorials, error: err } = await supabaseClient
		.from("tutorials")
		.select(
			"id, created_at, user_id, title, description, content, level, profiles_public (username,src/routes/tutorials/[slug]/+error.svelte avatar_url)"
		)
		.order("title", { ascending: true })
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

	if (!data)
		throw error(
			500,
			"Server error, this is probably not an issure on your end! - Data fetch returned empty!"
		)

	const { form } = data

	for (let i = 0; i < tutorials.length; i++) {
		if (slug === encodeSEO(tutorials[i].title + " by " + tutorials[i].profiles_public.username))
			return { tutorial: tutorials[i], form }
	}
	throw error(404, "Tutorial not found!")
}
