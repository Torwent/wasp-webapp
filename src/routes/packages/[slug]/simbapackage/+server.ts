import type { RequestHandler } from "@sveltejs/kit"
import { getPkgFile } from "$lib/packages"
import { supabase } from "$lib/database/supabase"
import { json } from "@sveltejs/kit"

export const GET: RequestHandler = async ({ params }) => {
	const { slug } = params

	const { data, error } = await supabase.from("packages").select("*").eq("name", slug)
	if (error || data[0] == null) return new Response(undefined, { status: 404 })

	return json(await getPkgFile(data[0].name))
}
