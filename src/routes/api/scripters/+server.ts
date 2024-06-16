import { SUPABASE_WEBHOOK_PASSWORD } from "$env/static/private"
import { stripe } from "$lib/server/stripe.server"
import { getProfile, updateScripterAccount } from "$lib/server/supabase.server"
import { error, json } from "@sveltejs/kit"

export const POST = async ({ request }) => {
	const hookPassword = request.headers.get("password")
	const req = await request.json()

	if (hookPassword !== SUPABASE_WEBHOOK_PASSWORD) error(403, "Webhook password doesn't match")
	if (req.type !== "INSERT" || req.schema !== "profiles" || req.table !== "scripters")
		error(403, "Webhook sent doesn't match this endpoint.")

	console.log("📌 POST => ", req)

	const {
		record: { id, url }
	} = req

	console.log("Creating connected account for " + id)
	const profile = await getProfile(id)
	if (!profile) error(500, "Counldn't find a profile for id: " + id)

	const account = await stripe.accounts.create({
		business_profile: {
			name: profile.username,
			url: "https://waspscripts.com/scripters/" + (url as string)
		},
		metadata: { id: profile.id, discord: profile.discord, email: profile.private.email },
		email: profile.private.email,
		type: "custom"
	})

	await updateScripterAccount(profile.id, account.id)
	return json({ success: "true" })
}
