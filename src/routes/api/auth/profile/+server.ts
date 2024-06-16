import { json } from "@sveltejs/kit"

export const GET = async ({ locals: { getProfile } }) => {
	await getProfile()
	return json({ success: "true" })
}
