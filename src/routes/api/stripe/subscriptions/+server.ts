import { STRIPE_WEBHOOK_SECRET_SUBSCRIPTIONS } from "$env/static/private"
import {
	stripe,
	insertSubscription,
	deleteSubscription,
	updateSubscription
} from "$lib/backend/supabase.server"
import { error, json } from "@sveltejs/kit"
import type Stripe from "stripe"

export const GET = async ({ request }) => {
	return json({ success: true })
}

export const POST = async ({ request, locals }) => {
	const sig = request.headers.get("stripe-signature") ?? ""
	let event: Stripe.Event

	const body = await request.text()

	try {
		event = stripe.webhooks.constructEvent(body, sig, STRIPE_WEBHOOK_SECRET_SUBSCRIPTIONS)
	} catch (err) {
		console.log(err)
		throw error(404, "Event is not valid! Body: " + body + " Error: " + err)
	}

	const { data, type } = event

	console.log(type)

	switch (type) {
		case "customer.subscription.deleted":
			const subscriptionDeleted = data.object as Stripe.Subscription
			await deleteSubscription(subscriptionDeleted.id)
			break

		case "customer.subscription.updated":
			const subscriptionUpdated = data.object as Stripe.Subscription
			await updateSubscription({
				subscription: subscriptionUpdated.id,
				id: subscriptionUpdated.metadata.user_id,
				product: subscriptionUpdated.items.data[0].price.product.toString(),
				price: subscriptionUpdated.items.data[0].price.id,
				date_end: new Date(subscriptionUpdated.current_period_end * 1000).toISOString(),
				date_start: new Date(subscriptionUpdated.start_date * 1000).toISOString(),
				cancel: subscriptionUpdated.cancel_at_period_end
			})
			break

		case "customer.subscription.created":
			const subscriptionCreated = data.object as Stripe.Subscription

			await insertSubscription({
				subscription: subscriptionCreated.id,
				id: subscriptionCreated.metadata.user_id,
				product: subscriptionCreated.items.data[0].price.product.toString(),
				price: subscriptionCreated.items.data[0].price.id,
				date_end: new Date(subscriptionCreated.current_period_end * 1000).toISOString(),
				date_start: new Date(subscriptionCreated.start_date * 1000).toISOString(),
				cancel: subscriptionCreated.cancel_at_period_end
			})

			break

		default:
			throw error(404, "Subscription event doesn't have a valid type! Type: " + type)
	}

	return json({
		success: "true"
	})
}
