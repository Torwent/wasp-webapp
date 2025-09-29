import { STRIPE_WEBHOOK_SECRET_DISPUTES } from "$env/static/private"
import { stripe } from "$lib/server/stripe.server"
import { error, json } from "@sveltejs/kit"
import type Stripe from "stripe"

export const POST = async ({ request }) => {
	const sig = request.headers.get("stripe-signature") ?? ""
	let event: Stripe.Event

	const body = await request.text()

	try {
		event = stripe.webhooks.constructEvent(body, sig, STRIPE_WEBHOOK_SECRET_DISPUTES)
	} catch (err) {
		console.log(err)
		error(404, "Event is not valid! Body: " + body + " Error: " + err)
	}

	const { data, type } = event

	console.log(type)

	switch (type) {
		case "charge.dispute.closed": {
			const dispute = data.object as Stripe.Dispute
			if (dispute.status != "lost") break

			break
		}

		default:
			error(404, "Dispute event doesn't have a valid type! Type: " + type)
	}

	return json({ success: "true" })
}
