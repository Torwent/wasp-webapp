import { redirect } from "@sveltejs/kit"
import type { Post } from "$lib/backend/types"
import { encodeSEO } from "$lib/utils"

export const load = async ({ params, parent }) => {
	const parentPromise = parent()
	let { slug } = params
	if (slug == null) throw redirect(300, "./")

	const { supabaseClient } = await parentPromise
	const { data, error } = await supabaseClient
		.from("tutorials")
		.select("id, created_at, user_id, author, title, description, content, level")
		.order("title", { ascending: true })

	if (error) {
		console.error("tutorials SELECT failed: " + error.message)
		throw redirect(300, "./")
	}

	for (let i = 0; i < data.length; i++) {
		if (slug === encodeSEO(data[i].title + " by " + data[i].author))
			return { post: data[i] as Post }
	}
	throw redirect(300, "./")
}
