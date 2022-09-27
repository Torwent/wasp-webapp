import { json } from "@sveltejs/kit"
import type { RequestHandler } from "@sveltejs/kit"
import { getData, supabase } from "$lib/database/supabase"

const getSignedURL = async (bucket: string, path: string, file: string) => {
	path += "/" + file

	console.log(supabase.auth.user())
	const { signedURL, error } = await supabase.storage.from(bucket).createSignedUrl(path, 10)

	if (error) return console.error(error)
	return signedURL
}

export const GET: RequestHandler = async ({ params }) => {
	const { slug } = params
	//if (slug == null) return json("Missing id")

	await getSignedURL("scripts", "274917ae-5643-4353-8f97-7fd0ac186f32/000000004", "script.simba")
	return json("")
}
