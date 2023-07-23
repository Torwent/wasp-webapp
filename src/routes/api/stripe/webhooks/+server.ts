import { getProfile, updateProfileRoles } from "$lib/backend/supabase.server"
import type Stripe from "stripe"

export const GET = async ({ request }) => {
	const rawBody = await request.text()
	//console.log("GET => Stripe webhook: ", rawBody)
	return new Response()
}

export const POST = async ({ request, locals: { stripe } }) => {
	const { type, data } = (await request.json()) as Stripe.Event
	const object = data.object as Stripe.Subscription

	console.log(type)
	if (object.object !== "subscription") return new Response()

	const customer = await stripe.customers.retrieve(object.customer.toString())
	if (customer.deleted) return new Response()

	const profile = await getProfile(customer.name ? customer.name : customer.metadata["id"])

	if (!profile) return new Response()

	if (type === "customer.subscription.updated") {
		profile.profiles_protected.subscription_end = new Date(
			object.current_period_end * 1000
		).toISOString()
		profile.profiles_protected.cancel_at_period_end = object.cancel_at_period_end
	} else {
		profile.profiles_protected.premium = false
		profile.profiles_protected.vip = false
		if (object.ended_at)
			profile.profiles_protected.subscription_end = new Date(object.ended_at * 1000).toISOString()
		else if (object.cancel_at_period_end)
			profile.profiles_protected.subscription_end = new Date(
				object.current_period_end * 1000
			).toISOString()

		profile.profiles_protected.cancel_at_period_end = object.cancel_at_period_end
	}

	await updateProfileRoles(profile)
	return new Response()
}
