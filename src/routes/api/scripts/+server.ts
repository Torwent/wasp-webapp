import { updateDownloaders } from "$lib/server/supabase.server"
import { error, json } from "@sveltejs/kit"

export const POST = async ({ request, locals: { session } }) => {
	if (!session) error(403, "You need to be logged in!")
	const data = await request.json()

	if (!Object.keys(data).includes("id")) error(403, "No script specified.")
	const ids = data.ids as string[]

	let promises: ReturnType<typeof updateDownloaders>[] = []
	ids.forEach((id) => promises.push(updateDownloaders(id, session.user.id)))

	const results = await Promise.all(promises)
	for (let i = 0; i < results.length; i++) {
		if (!results[i]) error(500, "Failed to add download to a script")
	}

	return json({ success: "true" })
}
