import { PUBLIC_SUPER_USER_ID } from "$env/static/public"
import { doLogin } from "$lib/backend/data.server"
import { subscriptionsSchema, checkoutSchema } from "$lib/backend/schemas"
import { stripe, updateCustomerID } from "$lib/backend/supabase.server"
import { error, redirect } from "@sveltejs/kit"
import type Stripe from "stripe"
import { setError, superValidate } from "sveltekit-superforms/server"

export const load = async (event) => {
	const promises = await Promise.all([
		superValidate(event, subscriptionsSchema),
		superValidate(event, checkoutSchema)
	])

	return {
		subscriptionsform: promises[0],
		checkoutForm: promises[1]
	}
}

export const actions = {
	checkout: async ({
		request,
		locals: { supabaseServer, getSession, getProfile },
		url: { origin, searchParams }
	}) => {
		const promises = await Promise.all([getSession(), getProfile(), request.formData()])
		const profile = promises[1]

		if (!promises[0] || !profile) {
			return await doLogin(supabaseServer, origin, new URLSearchParams("login&provider=discord"))
		}

		const form = await superValidate(promises[2], checkoutSchema)

		if (!profile.customer_id) {
			const customerSearch = await stripe.customers.search({ query: 'name: "' + profile.id + '"' })

			if (customerSearch.data.length !== 1)
				return setError(
					form,
					"",
					`You don't seem to have a customer_id assign for some reason. This shouldn't happen and has to be fixed manually.
					Refresh the page, if that doesn't solve the issue please contact support@waspscripts.com and send the following:
					id: ${profile.id} discord_id: ${profile.discord} registered_email: ${profile.email} username: ${profile.username}`
				)

			profile.customer_id = customerSearch.data[0].id

			const updateCustomer = await updateCustomerID(profile.id, profile.customer_id)

			if (!updateCustomer)
				return setError(
					form,
					"",
					`You don't seem to have a customer_id assign for some reason and one couldn't be created. This shouldn't happen and has to be fixed manually.
					Refresh the page, if that doesn't solve the issue please contact support@waspscripts.com and send the following:
					id: ${profile.id} discord_id: ${profile.discord} registered_email: ${profile.email}  username: ${profile.username}`
				)
		}

		const productID = searchParams.get("product")

		if (!productID) {
			return setError(
				form,
				"",
				"Something went wrong! Seems like no product was selected. If this keeps occuring please contact support@waspscripts.com"
			)
		}

		const product = form.data.products.find((product) => product.id === productID)
		if (!product) {
			return setError(
				form,
				"",
				"Something went wrong! Seems like the selected product is invalid. If this keeps occuring please contact support@waspscripts.com"
			)
		}

		if (profile.subscription.find((subscription) => subscription.id === productID)) {
			return setError(
				form,
				"",
				"Something went wrong! Seems like are already subscribed to this script. If this is not the case and this keeps occuring please contact support@waspscripts.com Erorr message:"
			)
		}

		const selectedPrice = product.prices.find((price) => price.active)

		if (!selectedPrice) {
			return setError(
				form,
				"",
				"Something went wrong! Seems like the selected price is invalid. If this keeps occuring please contact support@waspscripts.com Erorr message:"
			)
		}

		let session: Stripe.Checkout.Session

		const { data, error: productError } = await supabaseServer
			.schema("scripts")
			.from("products")
			.select("user_id, stripe_user")
			.eq("id", productID)
			.single()

		if (productError) {
			return setError(
				form,
				"",
				"Something went wrong! Seems like that product doesn't exist on the database. If this keeps occuring please contact support@waspscripts.com Erorr message:"
			)
		}

		const stripeUser = data.user_id !== PUBLIC_SUPER_USER_ID ? data.stripe_user : null

		try {
			session = await stripe.checkout.sessions.create({
				line_items: [{ price: selectedPrice.id, quantity: 1 }],
				customer: profile.customer_id,
				customer_update: { address: "auto", shipping: "auto" },
				mode: "subscription",
				billing_address_collection: "auto",
				automatic_tax: { enabled: stripeUser == null },
				payment_method_collection: "always",
				allow_promotion_codes: true,
				subscription_data: {
					on_behalf_of: stripeUser ?? undefined,
					application_fee_percent: stripeUser ? 20 : undefined,
					transfer_data: stripeUser ? { destination: stripeUser } : undefined,
					metadata: { user_id: profile.id }
				},
				success_url: origin + "/api/stripe/checkout/success?session_id={CHECKOUT_SESSION_ID}",
				cancel_url: origin + "/api/stripe/checkout/cancel?session_id={CHECKOUT_SESSION_ID}"
			})
		} catch (err: any) {
			console.error(err)
			return setError(form, "", err)
		}

		if (session && session.url) throw redirect(303, session.url)
		return setError(form, "", "Something went wrong!")
	},

	subscriptions: async ({
		request,
		locals: { supabaseServer, getSession, getProfile },
		url: { origin, searchParams }
	}) => {
		const promises = await Promise.all([getSession(), getProfile(), request.formData()])
		const profile = promises[1]

		if (!promises[0] || !profile) {
			return await doLogin(supabaseServer, origin, new URLSearchParams("login&provider=discord"))
		}

		if (!profile.customer_id) {
			throw error(
				403,
				"You don't have a customer id. This should not be possible! Please contact support@waspscripts.com"
			)
		}

		const form = await superValidate(promises[2], subscriptionsSchema)
		const subscriptionID = searchParams.get("product")

		if (!subscriptionID) {
			return setError(
				form,
				"",
				"Something went wrong! Seems like no subscription was selected. If this keeps occuring please contact support@waspscripts.com"
			)
		}

		const customer = await stripe.customers.retrieve(profile.customer_id, {
			expand: ["subscriptions"]
		})

		if (customer.deleted) {
			return setError(
				form,
				"",
				"That customer profile does not exist. Refresh the page, if the issue persists please contact support@waspscripts.com"
			)
		}

		if (!customer.subscriptions) {
			return setError(form, "", "You don't have any subscription to cancel.")
		}
		const subscriptions = customer.subscriptions.data.filter((sub) => sub.status === "active")
		if (subscriptions.length === 0) {
			return setError(
				form,
				"",
				"You don't have any subscription active. Refresh the page, if this keeps happening, please contact support@waspscripts.com"
			)
		}

		const subscription = subscriptions.find((subscription) => subscription.id === subscriptionID)

		if (!subscription) {
			return setError(
				form,
				"",
				"The subscription you want to cancel either doesn't exist or doesn't belong to you. Refresh the page, if this keeps happening, please contact support@waspscripts.com"
			)
		}

		await stripe.subscriptions.update(subscription.id, {
			cancel_at_period_end: !subscription.cancel_at_period_end
		})
		return
	}
}
