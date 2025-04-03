import { STRIPE_WEBHOOOK_SECRET_PRODUCTS } from "$env/static/private"
import { stripe } from "$lib/server/stripe.server"
import { WaspProduct } from "$lib/server/supabase.server"
import { error, json } from "@sveltejs/kit"
import type Stripe from "stripe"

export const POST = async ({ request }) => {
	const sig = request.headers.get("stripe-signature") ?? ""
	let event: Stripe.Event

	const body = await request.text()

	try {
		event = stripe.webhooks.constructEvent(body, sig, STRIPE_WEBHOOOK_SECRET_PRODUCTS)
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

	switch (type) {
		case "product.deleted":
			const productDeleted = data.object as Stripe.Product
			await WaspProduct.delete(productDeleted.id)
			break

		case "product.updated":
			if (!data.previous_attributes || !Object.keys(data.previous_attributes).includes("name"))
				break

			const productUpdated = data.object as Stripe.Product

			await WaspProduct.update(productUpdated.id, productUpdated.name)
			break

		case "product.created":
			console.log(data)
			const productCreated = data.object as Stripe.Product
			const { name } = productCreated
			const metadata = productCreated.metadata as unknown as ProductMetadata
			await WaspProduct.insert({
				id: productCreated.id,
				name: name,
				user_id: metadata.user_id,
				bundle: metadata.bundle ?? null,
				script: metadata.script ?? null,
				active: true,
				stripe_user: null
			})
			break

		default:
			throw error(404, "Product event doesn't have a valid type! Type: " + type)
	}

	return json({
		success: "true"
	})
}
