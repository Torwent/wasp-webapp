import { redirect } from "@sveltejs/kit"
import { encodeSEO } from "$lib/utils"
import type { TutorialWithAuthor } from "$lib/types/collection"

export const load = async ({ params, data, parent }) => {
	const parentPromise = parent()

	const { slug } = params
	if (slug == null) throw redirect(300, "./")

	const { supabaseClient } = await parentPromise
	const { data: tutorials, error } = await supabaseClient
		.from("tutorials")
		.select(
			"id, created_at, user_id, title, description, content, level, profiles_public (username, avatar_url)"
		)
		.order("title", { ascending: true })
		.returns<TutorialWithAuthor[]>()

	if (error) {
		console.error("tutorials SELECT failed: " + error.message)
		throw redirect(300, "./")
	}

	if (!data) {
		console.error("Server failed to return form data")
		throw redirect(300, "./")
	}

	const { form } = data

	for (let i = 0; i < tutorials.length; i++) {
		if (slug === encodeSEO(tutorials[i].title + " by " + tutorials[i].profiles_public.username))
			return { tutorial: tutorials[i], form }
	}
	throw redirect(300, "./")
}
