import { ADMIN_PASS } from "$env/static/private"
import { stripe, updateCustomerID } from "$lib/backend/supabase.server"
import type Stripe from "stripe"

export const POST = async ({ request }) => {
	const hookPassword = request.headers.get("password")
	const req = await request.json()

	if (hookPassword !== ADMIN_PASS) {
		console.error("Webhook password doesn't match")
		throw Error("Webhook password doesn't match")
	}
	if (req.type !== "INSERT" || req.schema !== "profiles" || req.table !== "profiles") {
		console.error("Webhook sent doesn't match this endpoint.")
		throw Error("Webhook sent doesn't match this endpoint.")
	}

	const {
		record: { id, username, discord, email }
	} = req

	console.log("Creating customer for " + id)
	let customer: Stripe.Customer
	const customerSearch = await stripe.customers.search({ query: `name:"${id}"` })
	if (customerSearch.data.length > 1) {
		throw Error("Profile with " + id + " seems to be corrupted!")
	}
	let customer_id

	if (customerSearch.data.length > 0) {
		customer_id = customerSearch.data[0].id
	} else {
		customer = await stripe.customers.create({
			email: email,
			name: id,
			metadata: {
				id: id,
				discord_id: discord,
				username: username
			}
		})

		customer_id = customer.id
	}

	await updateCustomerID(id, customer_id)

	return new Response()
}
