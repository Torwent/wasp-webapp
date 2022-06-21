import { supabase } from "$lib/supabase.js"

/**
 * @type {import('@sveltejs/kit').Load}
 */
export async function load({ params }) {
	const { slug } = params

	const { data: posts, error } = await supabase
		.from("posts")
		.select("*")
		.eq("title", decodeURI(slug))

	if (!error) {
		const post = posts[0]

		if (post) {
			return {
				props: {
					post
				}
			}
		}
	}

	return {
		status: 404,
		error: new Error(`blog/${slug} not found.`)
	}
}
