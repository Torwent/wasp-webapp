import { updateStatsScripts } from "$lib/backend/supabase.server"

export const POST = async ({ request, locals: { getProfile } }) => {
	const promises = await Promise.all([request.json(), getProfile()])

	const data = promises[0]
	const profile = promises[1]
	if (!profile) return new Response()

	if (!Object.keys(data).includes("ids")) return new Response()
	const ids = data.ids as string[]

	ids.forEach(async (id) => {
		await updateStatsScripts(id, profile.id)
	})

	return new Response()
}
