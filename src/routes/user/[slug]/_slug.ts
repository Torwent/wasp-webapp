import { supabase } from "$lib/supabase"

/**
 * @type {import('@sveltejs/kit').Load}
 */
export async function load({ params }: { params: { slug: string } }) {
	const { slug } = params

	const { data: users, error } = await supabase.from("profile").select("*").eq("id", slug)

	if (!error) {
		const user = users[0]

		if (user) {
			return {
				props: {
					user
				}
			}
		}
	}

	return {
		status: 404,
		error: new Error(`user/${slug} not found.`)
	}
}
