import { ADMIN_PASS } from "$env/static/private"
import { getProfile, stripe, updateProfileSubscription } from "$lib/backend/supabase.server"
import type Stripe from "stripe"

export const POST = async ({ request }) => {
	const hookPassword = request.headers.get("password")
	const req = await request.json()

	if (hookPassword !== ADMIN_PASS) {
		console.error("Webhook password doesn't match")
		throw Error("Webhook password doesn't match")
	}
	if (req.type !== "INSERT" || req.schema !== "profiles" || req.table !== "subscriptions") {
		console.error("Webhook sent doesn't match this endpoint.")
		throw Error("Webhook sent doesn't match this endpoint.")
	}

	const {
		record: { id }
	} = req

	const profile = await getProfile(id)
	if (!profile) {
		console.error("Something went wrong getting " + id + " profile.")
		throw Error("Something went wrong getting " + id + " profile.")
	}

	if (!profile.subscriptions.customer_id) {
		console.log("Creating customer for " + id)
		let customer: Stripe.Customer
		const customerSearch = await stripe.customers.search({ query: `name:"${profile.id}"` })
		if (customerSearch.data.length > 1) {
			throw Error("Profile with " + id + " seems to be corrupted!")
		}

		if (customerSearch.data.length > 0) {
			profile.subscriptions.customer_id = customerSearch.data[0].id
		} else {
			customer = await stripe.customers.create({
				email: profile.private.email,
				name: profile.id,
				metadata: {
					id: profile.id,
					discord_id: profile.discord,
					username: profile.username
				}
			})
			profile.subscriptions.customer_id = customer.id
		}

		await updateProfileSubscription(profile)
	}

	return new Response()
}
