import { supabase } from "$lib/supabase"

/**
 * @type {import('@sveltejs/kit').Load}
 */
export async function load({ params }: { params: { slug: string } }) {
	const { slug } = params

	let id = slug.substring(slug.indexOf("&") + 1)

	const { data, error } = await supabase.from("scripts").select("*").eq("id", id)

	if (!error) {
		const script = data[0]

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
