import { redirect } from "@sveltejs/kit"

export const GET = async ({ locals: { getProfile } }) => {
	const profile = await getProfile()
	if (!profile) console.log("Checkout canceled!")
	else console.log("User " + profile.id + " canceled checkout!")
	throw redirect(303, "/subscriptions")
}
