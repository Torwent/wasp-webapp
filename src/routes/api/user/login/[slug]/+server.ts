import { json } from "@sveltejs/kit"
import type { RequestHandler } from "@sveltejs/kit"
import { supabase } from "$lib/database/supabase"

export const POST: RequestHandler = async ({ params }) => {
	const { slug } = params
	if (slug == null) return json("Missing user")

	return json("")
}
