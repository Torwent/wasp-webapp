import { updateReporters } from "$lib/server/supabase.server"
import { error, json } from "@sveltejs/kit"

export const POST = async ({ request, locals: { user } }) => {
	if (!user) error(403, "You need to be logged in!")
	const data = await request.json()

	if (!Object.keys(data).includes("id")) error(403, "No script specified.")
	await updateReporters(data.id as string, user.id)

	return json({ success: "true" })
}
