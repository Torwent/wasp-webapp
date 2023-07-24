import { doLogin } from "$lib/backend/data.server"
import { premiumSchema } from "$lib/backend/schemas"
import { error, redirect } from "@sveltejs/kit"
import type Stripe from "stripe"
import { superValidate } from "sveltekit-superforms/server"

export const load = async (event) => {
	const form = superValidate(event, premiumSchema)
	const {
		locals: { getProfile, stripe }
	} = event
	const product = await stripe.products.list({
		limit: 1,
		active: true
	})

	if (product.data.length === 0)
		throw error(404, "Something went wrong retrieving products from stripe!")

	const prices = stripe.prices.list({
		product: product.data[0].id,
		limit: 4,
		active: true
	})

	let subscription: Stripe.Subscription | null = null
	const profile = await getProfile()
	if (profile) {
		const { data: customers } = await stripe.customers.search({
			query: 'name: "' + profile.id + '"',
			limit: 1,
			expand: ["data.subscriptions"]
		})
		if (customers.length > 0) {
			const customer = customers[0]
			if (customer.subscriptions && customer.subscriptions.data.length > 0) {
				if (customer.subscriptions.data.length > 1)
					throw error(
						403,
						"You seem to have more than one subscription active. This should not happen, please contact support@waspscripts.com"
					)

				if (customer.subscriptions.data[0].status === "active")
					subscription = customer.subscriptions.data[0]
			}
		}
	}

	return { form, prices, subscription }
}

export const actions = {
	checkout: async ({
		request,
		locals: { supabaseServer, getSession, getProfile, stripe },
		url: { origin }
	}) => {
		const promises = await Promise.all([getSession(), getProfile(), request.formData()])
		const profile = promises[1]

		if (!promises[0] || !profile) {
			return await doLogin(supabaseServer, origin, new URLSearchParams("login&provider=discord"))
		}

		if (profile.profiles_protected.premium) {
			throw error(403, "You are premium already!")
		}

		if (!profile.profiles_protected.customer_id) {
			throw error(
				403,
				"You don't seem to have a customer_id assign for some reason. This shouldn't happen. Refresh the page, if that doesn't solve the issue please contact support@waspscripts.com"
			)
		}
		const form = await superValidate(promises[2], premiumSchema)

		const session = await stripe.checkout.sessions.create({
			payment_method_types: ["card", "link"],
			line_items: [{ price: form.data.plan, quantity: 1 }],
			customer: profile.profiles_protected.customer_id,
			customer_update: { address: "auto", shipping: "auto" },
			mode: "subscription",
			billing_address_collection: "auto",
			success_url: origin + "/api/stripe/checkout/success?session_id={CHECKOUT_SESSION_ID}",
			cancel_url: origin + "/api/stripe/checkout/cancel?session_id={CHECKOUT_SESSION_ID}",
			automatic_tax: { enabled: true },
			metadata: { id: profile.id, discord_id: profile.discord_id, username: profile.username },
			payment_method_collection: "always"
		})

		if (session && session.url) throw redirect(303, session.url)
		throw error(403, "Something went wrong!")
	},
	cancel: async ({
		request,
		locals: { supabaseServer, getSession, getProfile, stripe },
		url: { origin }
	}) => {
		const promises = await Promise.all([getSession(), getProfile(), request.formData()])
		const profile = promises[1]

		if (!promises[0] || !profile) {
			return await doLogin(supabaseServer, origin, new URLSearchParams("login&provider=discord"))
		}

		if (!profile?.profiles_protected.premium) {
			throw error(403, "You are not premium!")
		}

		const { data: customers } = await stripe.customers.search({
			query: 'name: "' + profile.id + '"',
			limit: 1,
			expand: ["data.subscriptions"]
		})

		if (customers.length === 0 || customers.length > 1)
			throw error(
				404,
				"Something went wrong, your customer profile was not found. Please contact support@waspscripts.com"
			)

		const customer = customers[0]
		if (customer.subscriptions && customer.subscriptions.data.length > 0) {
			if (customer.subscriptions.data.length > 1)
				throw error(
					403,
					"You seem to have more than one subscription active. This should not happen, please contact support@waspscripts.com"
				)

			if (customer.subscriptions.data[0].status === "active") {
				let subscription = customer.subscriptions.data[0]
				await stripe.subscriptions.update(subscription.id, { cancel_at_period_end: true })
				throw redirect(303, "/premium")
			}
		}
		throw error(403, "Something went wrong!")
	},
	reenable: async ({
		request,
		locals: { supabaseServer, getSession, getProfile, stripe },
		url: { origin }
	}) => {
		const promises = await Promise.all([getSession(), getProfile(), request.formData()])
		const profile = promises[1]

		if (!promises[0] || !profile) {
			return await doLogin(supabaseServer, origin, new URLSearchParams("login&provider=discord"))
		}

		if (!profile?.profiles_protected.premium) {
			throw error(403, "You are not premium!")
		}

		const { data: customers } = await stripe.customers.search({
			query: 'name: "' + profile.id + '"',
			limit: 1,
			expand: ["data.subscriptions"]
		})

		if (customers.length === 0 || customers.length > 1)
			throw error(
				404,
				"Something went wrong, your customer profile was not found. Please contact support@waspscripts.com"
			)

		const customer = customers[0]

		if (customer.subscriptions && customer.subscriptions.data.length > 0) {
			if (customer.subscriptions.data.length > 1)
				throw error(
					403,
					"You seem to have more than one subscription active. This should not happen, please contact support@waspscripts.com"
				)

			if (customer.subscriptions.data[0].status === "active") {
				let subscription = customer.subscriptions.data[0]
				await stripe.subscriptions.update(subscription.id, { cancel_at_period_end: false })
				throw redirect(303, "/premium")
			}
		}
		throw error(403, "Something went wrong!")
	}
}
