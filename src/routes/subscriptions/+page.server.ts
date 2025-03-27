import { PUBLIC_SUPER_USER_ID } from "$env/static/public"
import { stripe, createCheckoutSession, createCustomerPortal } from "$lib/server/stripe.server"
import { subscriptionsSchema, checkoutSchema } from "$lib/client/schemas"
import { doLogin, updateCustomerID } from "$lib/server/supabase.server"
import { error, redirect } from "@sveltejs/kit"
import { setError, superValidate } from "sveltekit-superforms/server"
import { zod } from "sveltekit-superforms/adapters"

export const load = async ({ locals: { getSubscriptions, getFreeAccess } }) => {
	const promises = await Promise.all([
		superValidate(zod(subscriptionsSchema)),
		superValidate(zod(checkoutSchema))
	])

	return {
		subscriptionsform: promises[0],
		checkoutForm: promises[1],
		subscriptions: getSubscriptions(),
		freeAccess: getFreeAccess()
	}
}

export const actions = {
	checkout: async ({
		request,
		locals: { supabaseServer, user, getProfile, getSubscriptions, getFreeAccess },
		url: { origin, searchParams }
	}) => {
		if (!user) {
			return await doLogin(supabaseServer, origin, new URLSearchParams("login&provider=discord"))
		}

		const promises = await Promise.all([
			getProfile(),
			getSubscriptions(),
			getFreeAccess(),
			superValidate(request, zod(checkoutSchema))
		])
		const profile = promises[0]
		const subs = promises[1]
		const free = promises[2]
		const form = promises[3]

		if (!profile) {
			return await doLogin(supabaseServer, origin, new URLSearchParams("login&provider=discord"))
		}

		if (!profile.customer_id) {
			const customerSearch = await stripe.customers.search({ query: 'name: "' + profile.id + '"' })

			if (customerSearch.data.length !== 1) {
				return setError(
					form,
					"",
					`You don't seem to have a customer_id assign for some reason. This shouldn't happen and has to be fixed manually.
					Refresh the page, if that doesn't solve the issue please contact support@waspscripts.com and send the following:
					id: ${profile.id} discord_id: ${profile.discord} registered_email: ${user.email} username: ${profile.username}`
				)
			}

			profile.customer_id = customerSearch.data[0].id

			const updateCustomer = await updateCustomerID(profile.id, profile.customer_id)

			if (!updateCustomer) {
				return setError(
					form,
					"",
					`You don't seem to have a customer_id assign for some reason and one couldn't be created. This shouldn't happen and has to be fixed manually.
					Refresh the page, if that doesn't solve the issue please contact support@waspscripts.com and send the following:
					id: ${profile.id} discord_id: ${profile.discord} registered_email: ${user.email}  username: ${profile.username}`
				)
			}
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

		if (subs?.find((subscription) => subscription.product === productID)) {
			return setError(
				form,
				"",
				"Something went wrong! Seems like are already subscribed to this product. If this is not the case and this keeps occuring please contact support@waspscripts.com"
			)
		}

		if (free?.find((access) => access.product === productID)) {
			return setError(
				form,
				"",
				"Something went wrong! Seems like already have free access to this product. If this is not the case and this keeps occuring please contact support@waspscripts.com"
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

		const start = performance.now()
		const { data, error: err } = await supabaseServer
			.schema("scripts")
			.from("products")
			.select("user_id, stripe_user")
			.eq("id", productID)
			.single()
		console.log(
			`└────🦾 Product owner data took ${(performance.now() - start).toFixed(2)} ms to check!`
		)

		if (err) {
			return setError(
				form,
				"",
				"Something went wrong! Seems like that product doesn't exist on the database. If this keeps occuring please contact support@waspscripts.com Erorr message:"
			)
		}

		const stripeUser = data.user_id !== PUBLIC_SUPER_USER_ID ? data.stripe_user : null

		const url = await createCheckoutSession(
			profile.id,
			profile.customer_id,
			stripeUser,
			selectedPrice.id,
			origin
		)

		if (url) redirect(303, url)
		return setError(form, "", "Something went wrong!")
	},

	portal: async ({ locals: { supabaseServer, user, getProfile }, url: { origin } }) => {
		if (!user) {
			return await doLogin(supabaseServer, origin, new URLSearchParams("login&provider=discord"))
		}

		const promises = await Promise.all([getProfile()])
		const profile = promises[0]

		if (!profile) {
			return await doLogin(supabaseServer, origin, new URLSearchParams("login&provider=discord"))
		}

		if (!profile.customer_id) {
			const customerSearch = await stripe.customers.search({ query: 'name: "' + profile.id + '"' })

			if (customerSearch.data.length !== 1) {
				error(
					404,
					`You don't seem to have a customer_id assign for some reason. This shouldn't happen and has to be fixed manually.
					Refresh the page, if that doesn't solve the issue please contact support@waspscripts.com and send the following:
					id: ${profile.id} discord_id: ${profile.discord} registered_email: ${user.email} username: ${profile.username}`
				)
			}

			profile.customer_id = customerSearch.data[0].id

			const updateCustomer = await updateCustomerID(profile.id, profile.customer_id)

			if (!updateCustomer) {
				return error(
					404,
					`You don't seem to have a customer_id assign for some reason and one couldn't be created. This shouldn't happen and has to be fixed manually.
					Refresh the page, if that doesn't solve the issue please contact support@waspscripts.com and send the following:
					id: ${profile.id} discord_id: ${profile.discord} registered_email: ${user.email}  username: ${profile.username}`
				)
			}
		}

		const url = await createCustomerPortal(profile.customer_id, origin)
		if (url) redirect(303, url)
		error(404, "Something went wrong!")
	},

	subscriptions: async ({
		request,
		locals: { supabaseServer, user, getProfile },
		url: { origin, searchParams }
	}) => {
		if (!user) {
			return await doLogin(supabaseServer, origin, new URLSearchParams("login&provider=discord"))
		}

		const promises = await Promise.all([
			getProfile(),
			superValidate(request, zod(subscriptionsSchema))
		])

		const profile = promises[0]
		const form = promises[1]

		if (!profile) {
			return await doLogin(supabaseServer, origin, new URLSearchParams("login&provider=discord"))
		}

		if (!profile.customer_id) {
			return setError(
				form,
				"",
				"You don't have a customer id. This should not be possible! Please contact support@waspscripts.com"
			)
		}

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

		return { form, subscription: subscriptionID }
	}
}
