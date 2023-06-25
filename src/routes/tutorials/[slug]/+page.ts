import { redirect } from "@sveltejs/kit"
import { encodeSEO } from "$lib/utils"
import type { TutorialWithAuthor } from "$lib/types/collection"

export const load = async ({ params, parent }) => {
	const parentPromise = parent()
	let { slug } = params
	if (slug == null) throw redirect(300, "./")

	const { supabaseClient } = await parentPromise
	const { data, error } = await supabaseClient
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

	for (let i = 0; i < data.length; i++) {
		if (slug === encodeSEO(data[i].title + " by " + data[i].profiles_public.username))
			return { tutorial: data[i] }
	}
	throw redirect(300, "./")
}
