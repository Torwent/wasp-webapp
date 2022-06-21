import { supabase } from "$lib/supabase.js"

/**
 * @type {import('@sveltejs/kit').Load}
 */
export async function load({ params }) {
	const { slug } = params

	const { data: posts, error } = await supabase
		.from("scripts")
		.select("*")
		.eq("title", decodeURI(slug))

	if (!error) {
		const script = posts[0]

		if (script) {
			return {
				props: {
					script
				}
			}
		}
	}

	return {
		status: 404,
		error: new Error(`scripts/${slug} not found.`)
	}
}
