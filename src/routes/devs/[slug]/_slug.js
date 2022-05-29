import { supabase } from "$lib/supabase.js"

/**
 * @type {import('@sveltejs/kit').Load}
 */
export async function load({ params }) {
	const { slug } = params

	const { data: devs, error } = await supabase.from("devs").select("*").eq("username", slug)

	if (!error) {
		const dev = devs[0]

		if (dev) {
			return {
				props: {
					dev
				}
			}
		}
	}

	return {
		status: 404,
		error: new Error(`devs/${slug} not found.`)
	}
}
