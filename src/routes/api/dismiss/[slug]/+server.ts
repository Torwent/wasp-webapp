import { json } from "@sveltejs/kit"
import type { RequestHandler } from "@sveltejs/kit"
import { getData, getServiceSupabase } from "$lib/database/supabase"

export const POST: RequestHandler = async ({ params }) => {
	const { slug } = params
	if (slug == null) return json("Missing id")

	const data = await getData("profile", slug)
	if (data == null) return json("Profile doesn't exist")

	const profile = data[0]

	const ssb = getServiceSupabase()

	const { error } = await ssb
		.from("profile")
		.update({ dismissed_warning: true })
		.match({ id: profile.id })

	ssb.auth.signOut()
	if (error) return json(error)

	return json("")
}
