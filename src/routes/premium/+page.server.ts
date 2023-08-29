import { doLogin } from "$lib/backend/data.server"
import { premiumSchema } from "$lib/backend/schemas"
import { stripe } from "$lib/backend/supabase.server"
import { error, redirect } from "@sveltejs/kit"
import type Stripe from "stripe"
import { setError, superValidate } from "sveltekit-superforms/server"

export const load = async (event) => {
	return { form: superValidate(event, premiumSchema) }
}

export const actions = {
	checkout: async ({
		request,
		locals: { supabaseServer, getSession, getProfile },
		url: { origin }
	}) => {
		const promises = await Promise.all([getSession(), getProfile(), request.formData()])
		const profile = promises[1]

		if (!promises[0] || !profile) {
			return await doLogin(supabaseServer, origin, new URLSearchParams("login&provider=discord"))
		}

		const form = await superValidate(promises[2], premiumSchema)

		if (profile.roles.premium) {
			return setError(form, "", "You are premium already!")
		}

		if (!profile.customer_id) {
			return setError(
				form,
				"",
				"You don't seem to have a customer_id assign for some reason. This shouldn't happen. Refresh the page, if that doesn't solve the issue please contact support@waspscripts.com"
			)
		}

		if (form.data.plan === "")
			return setError(
				form,
				"",
				"Something went wrong! Seems like no plan was selected? If this keeps occuring please contact support@waspscripts.com"
			)

		let session: Stripe.Checkout.Session
		try {
			session = await stripe.checkout.sessions.create({
				payment_method_types: ["card", "link"],
				line_items: [{ price: form.data.plan, quantity: 1 }],
				customer: profile.customer_id,
				customer_update: { address: "auto", shipping: "auto" },
				mode: "subscription",
				billing_address_collection: "auto",
				success_url: origin + "/api/stripe/checkout/success?session_id={CHECKOUT_SESSION_ID}",
				cancel_url: origin + "/api/stripe/checkout/cancel?session_id={CHECKOUT_SESSION_ID}",
				automatic_tax: { enabled: true },
				metadata: { id: profile.id, discord_id: profile.discord, username: profile.username },
				payment_method_collection: "always"
			})
		} catch (err: any) {
			return setError(form, "", err)
		}

		if (session && session.url) throw redirect(303, session.url)
		return setError(form, "", "Something went wrong!")
	},

	cancel: async ({
		request,
		locals: { supabaseServer, getSession, getProfile },
		url: { origin }
	}) => {
		const promises = await Promise.all([getSession(), getProfile(), request.formData()])
		const profile = promises[1]

		if (!promises[0] || !profile) {
			return await doLogin(supabaseServer, origin, new URLSearchParams("login&provider=discord"))
		}

		if (!profile.roles.premium) {
			throw error(403, "You are not premium!")
		}

		if (!profile.customer_id) {
			throw error(
				403,
				"You premium and you don't have a customer id. This should not be possible! Please contact support@waspscripts.com"
			)
		}

		const customer = await stripe.customers.retrieve(profile.customer_id, {
			expand: ["subscriptions"]
		})

		if (customer.deleted) {
			throw error(
				403,
				"That customer profile does not exist. Refresh the page, if the issue persists please contact support@waspscripts.com"
			)
		}

		if (!customer.subscriptions) {
			throw error(403, "You don't have any subscription to cancel.")
		}

		const subs = customer.subscriptions.data.filter((sub) => sub.status === "active")

		if (subs.length > 0) {
			if (subs.length > 1) {
				throw error(
					403,
					"You seem to have more than one subscription active. This should not happen, please contact support@waspscripts.com"
				)
			}

			await stripe.subscriptions.update(subs[0].id, { cancel_at_period_end: true })
			throw redirect(303, "/premium")
		}
		throw error(403, "Something went wrong!")
	},
	reenable: async ({
		request,
		locals: { supabaseServer, getSession, getProfile },
		url: { origin }
	}) => {
		const promises = await Promise.all([getSession(), getProfile(), request.formData()])
		const profile = promises[1]

		if (!promises[0] || !profile) {
			return await doLogin(supabaseServer, origin, new URLSearchParams("login&provider=discord"))
		}

		if (!profile.roles.premium) {
			throw error(403, "You are not premium!")
		}

		if (!profile.customer_id) {
			throw error(
				403,
				"You premium and you don't have a customer id. This should not be possible! Please contact support@waspscripts.com"
			)
		}

		const customer = await stripe.customers.retrieve(profile.customer_id, {
			expand: ["subscriptions"]
		})

		if (customer.deleted) {
			throw error(
				403,
				"That customer profile does not exist. Refresh the page, if the issue persists please contact support@waspscripts.com"
			)
		}

		if (!customer.subscriptions) {
			throw error(403, "You don't have any subscription to cancel.")
		}

		const subs = customer.subscriptions.data.filter((sub) => sub.status === "active")

		if (subs.length > 0) {
			if (subs.length > 1) {
				throw error(
					403,
					"You seem to have more than one subscription active. This should not happen, please contact support@waspscripts.com"
				)
			}

			await stripe.subscriptions.update(subs[0].id, { cancel_at_period_end: false })
			throw redirect(303, "/premium")
		}
		throw error(403, "Something went wrong!")
	}
}
