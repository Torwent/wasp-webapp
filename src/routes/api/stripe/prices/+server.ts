import { STRIPE_WEBHOOK_SECRET_PRICES } from "$env/static/private"
import { stripe } from "$lib/server/stripe.server"
import { WaspPrice } from "$lib/server/supabase.server.js"
import { error, json } from "@sveltejs/kit"
import type Stripe from "stripe"

export const POST = async ({ request }) => {
	const sig = request.headers.get("stripe-signature") ?? ""
	let event: Stripe.Event

	const body = await request.text()

	try {
		event = stripe.webhooks.constructEvent(body, sig, STRIPE_WEBHOOK_SECRET_PRICES)
	} catch (err) {
		console.log(err)
		throw error(404, "Event is not valid! Body: " + body + " Error: " + err)
	}

	const { data, type } = event

	switch (type) {
		case "price.deleted":
			const priceDeleted = data.object as Stripe.Price
			await WaspPrice.delete(priceDeleted.id)
			break

		case "price.updated":
			const priceUpdated = data.object as Stripe.Price
			await WaspPrice.update({
				id: priceUpdated.id,
				product: priceUpdated.product.toString(),
				amount: priceUpdated.unit_amount ?? 100,
				interval: priceUpdated.recurring?.interval ?? "month",
				currency: priceUpdated.currency,
				active: priceUpdated.active
			})
			break

		case "price.created":
			const priceCreated = data.object as Stripe.Price
			await WaspPrice.insert({
				id: priceCreated.id,
				product: priceCreated.product.toString(),
				amount: priceCreated.unit_amount ?? 100,
				interval: priceCreated.recurring?.interval ?? "month",
				currency: priceCreated.currency,
				active: priceCreated.active
			})
			break

		default:
			throw error(404, "Price event doesn't have a valid type! Type: " + type)
	}

	return json({
		success: "true"
	})
}
