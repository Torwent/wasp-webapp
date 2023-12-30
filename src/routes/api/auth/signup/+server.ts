import { ADMIN_PASS } from "$env/static/private"
import { createStripeCustomer } from "$lib/backend/data.server"
import { getPrivateProfile, updateCustomerID } from "$lib/backend/supabase.server"

export const POST = async ({ request }) => {
	const hookPassword = request.headers.get("password")
	const req = await request.json()

	if (hookPassword !== ADMIN_PASS) {
		console.error("Webhook password doesn't match")
		throw Error("Webhook password doesn't match")
	}

	if (req.type !== "INSERT" || req.schema !== "profiles" || req.table !== "private") {
		console.error("Webhook sent doesn't match this endpoint.")
		throw Error(
			"Webhook sent doesn't match this endpoint. Type: " +
				req.type +
				" Schema: " +
				req.schema +
				" Table: " +
				req.table
		)
	}

	const { id, email } = req.record

	const profile = await getPrivateProfile(id)

	if (!profile) {
		console.error("Failed to load user profile for: " + id)
		throw Error("Failed to load user private profile for: " + id)
	}

	console.log("Creating customer for " + id)
	const customer = await createStripeCustomer(id, email, profile.discord, profile.username)

	if (!customer) {
		throw Error("Failed to create stripe user for " + id)
	}
	await updateCustomerID(id, customer)

	return new Response()
}
