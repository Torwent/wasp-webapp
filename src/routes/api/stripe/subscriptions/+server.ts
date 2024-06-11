import { STRIPE_WEBHOOK_SECRET_SUBSCRIPTIONS } from "$env/static/private"
import {
	stripe,
	insertSubscription,
	deleteSubscription,
	upsertSubscription
} from "$lib/backend/supabase.server"
import { error, json } from "@sveltejs/kit"
import type Stripe from "stripe"

export const POST = async ({ request }) => {
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
		case "customer.subscription.created":
			const subscriptionCreated = data.object as Stripe.Subscription
			if (subscriptionCreated.status !== "active") break

			const { error: errInsert } = await insertSubscription({
				subscription: subscriptionCreated.id,
				id: subscriptionCreated.metadata.user_id,
				product: subscriptionCreated.items.data[0].price.product.toString(),
				price: subscriptionCreated.items.data[0].price.id,
				date_end: new Date(subscriptionCreated.current_period_end * 1000).toISOString(),
				date_start: new Date(subscriptionCreated.start_date * 1000).toISOString(),
				cancel: subscriptionCreated.cancel_at_period_end,
				disabled: false
			})

			if (errInsert) throw error(404, "Error inserting subscription: " + JSON.stringify(errInsert))

			break

		case "customer.subscription.updated":
			const subscriptionUpdated = data.object as Stripe.Subscription
			if (subscriptionUpdated.status !== "active" && subscriptionUpdated.status !== "canceled")
				break

			if (!subscriptionUpdated.metadata.user_id)
				return json({
					success: "true",
					message: "Upgrade.Chat user."
				})

			const { error: errUpsert } = await upsertSubscription({
				subscription: subscriptionUpdated.id,
				id: subscriptionUpdated.metadata.user_id,
				product: subscriptionUpdated.items.data[0].price.product.toString(),
				price: subscriptionUpdated.items.data[0].price.id,
				date_end: new Date(subscriptionUpdated.current_period_end * 1000).toISOString(),
				date_start: new Date(subscriptionUpdated.start_date * 1000).toISOString(),
				cancel: subscriptionUpdated.cancel_at_period_end,
				disabled: false
			})

			if (errUpsert) throw error(404, "Error upserting subscription: " + errUpsert)

			break

		case "customer.subscription.deleted":
			const subscriptionDeleted = data.object as Stripe.Subscription
			const { error: errDelete } = await deleteSubscription(subscriptionDeleted.id)
			if (errDelete) throw error(404, "Error deleting subscription: " + errDelete)
			const last_invoice = subscriptionDeleted.latest_invoice
			if (last_invoice) {
				try {
					stripe.invoices.voidInvoice(last_invoice.toString())
				} catch (err) {
					console.error(err)
					throw error(404, "Failed to void invoce: " + last_invoice + " for sub: " + subscriptionDeleted.id + "  Error: " + err)
				}
			}
			break

		default:
			throw error(404, "Subscription event doesn't have a valid type! Type: " + type)
	}

	return json({
		success: "true"
	})
}
