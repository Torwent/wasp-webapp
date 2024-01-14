//import { STRIPE_WEBHOOOK_SECRET_LOCAL } from "$env/static/private"
import {
	insertProduct,
	deleteProduct,
	stripe,
	updateProduct,
	insertPrice,
	deletePrice,
	updatePrice,
	insertSubscription,
	deleteSubscription,
	upsertSubscription
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
		event = stripe.webhooks.constructEvent(body, sig, "STRIPE_WEBHOOOK_SECRET_LOCAL")
	} catch (err) {
		console.log(err)
		throw error(404, "Event is not valid! Body: " + body + " Error: " + err)
	}

	const { data, type } = event

	interface ProductMetadata {
		user_id: string
		bundle?: string
		script?: string
	}

	console.log(type)

	switch (type) {
		case "payment_intent.succeeded":
			const paymentIntentSucceeded = data.object as Stripe.PaymentIntent
			break

		case "customer.subscription.created":
			const subscriptionCreated = data.object as Stripe.Subscription
			if (subscriptionCreated.status !== "active") break

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

		case "customer.subscription.updated":
			const subscriptionUpdated = data.object as Stripe.Subscription
			if (subscriptionUpdated.status !== "active" && subscriptionUpdated.status !== "canceled")
				break

			await upsertSubscription({
				subscription: subscriptionUpdated.id,
				id: subscriptionUpdated.metadata.user_id,
				product: subscriptionUpdated.items.data[0].price.product.toString(),
				price: subscriptionUpdated.items.data[0].price.id,
				date_end: new Date(subscriptionUpdated.current_period_end * 1000).toISOString(),
				date_start: new Date(subscriptionUpdated.start_date * 1000).toISOString(),
				cancel: subscriptionUpdated.cancel_at_period_end
			})
			break

		case "customer.subscription.deleted":
			const subscriptionDeleted = data.object as Stripe.Subscription
			await deleteSubscription(subscriptionDeleted.id)
			break

		case "product.deleted":
			const productDeleted = data.object as Stripe.Product
			await deleteProduct(productDeleted.id)
			break

		case "product.updated":
			if (!data.previous_attributes || !Object.keys(data.previous_attributes).includes("name"))
				break

			const productUpdated = data.object as Stripe.Product

			await updateProduct(productUpdated.id, productUpdated.name)
			break

		case "product.created":
			const productCreated = data.object as Stripe.Product
			const { name } = productCreated
			const metadata = productCreated.metadata as unknown as ProductMetadata
			await insertProduct({
				id: productCreated.id,
				name: name,
				user_id: metadata.user_id,
				bundle: metadata.bundle ?? null,
				script: metadata.script ?? null,
				active: true,
				stripe_user: null
			})
			break

		case "price.deleted":
			const priceDeleted = data.object as Stripe.Price
			await deletePrice(priceDeleted.id)
			break

		case "price.updated":
			const priceUpdated = data.object as Stripe.Price
			await updatePrice({
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
			await insertPrice({
				id: priceCreated.id,
				product: priceCreated.product.toString(),
				amount: priceCreated.unit_amount ?? 100,
				interval: priceCreated.recurring?.interval ?? "month",
				currency: priceCreated.currency,
				active: priceCreated.active
			})
			break

		default:
			throw error(404, "Product event doesn't have a valid type! Type: " + type)
	}

	return json({
		success: "true"
	})
}
