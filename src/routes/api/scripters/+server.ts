import { ADMIN_PASS } from "$env/static/private"
import { getProfile, stripe, updateScripterAccount } from "$lib/backend/supabase.server"
import { error } from "@sveltejs/kit"

export const POST = async ({ request }) => {
	const hookPassword = request.headers.get("password")
	const req = await request.json()

	if (hookPassword !== ADMIN_PASS) {
		console.error("Webhook password doesn't match")
		throw error(403, "Webhook password doesn't match")
	}
	if (req.type !== "INSERT" || req.schema !== "profiles" || req.table !== "scripters") {
		console.error("Webhook sent doesn't match this endpoint.")
		throw error(403, "Webhook sent doesn't match this endpoint.")
	}

	console.log("POST => ", req)

	const {
		record: { id, url }
	} = req

	console.log("Creating connected account for " + id)
	const profile = await getProfile(id)
	if (!profile) throw error(500, "Counldn't find a profile for id: " + id)

	const account = await stripe.accounts.create({
		business_profile: {
			name: profile.username,
			url: "https://waspscripts.com/developers/" + url
		},
		metadata: { id: profile.id, discord: profile.discord, email: profile.private.email },
		email: profile.email,
		type: "custom"
	})

	await updateScripterAccount(profile.id, account.id)
	return new Response()
}
