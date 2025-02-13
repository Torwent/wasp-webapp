import { PUBLIC_SUPER_USER_ID } from "$env/static/public"
import { createCheckoutSession, stripe } from "$lib/server/stripe.server"
import {
	doLogin,
	removeScriptBroken,
	updateCustomerID,
	updateReporters
} from "$lib/server/supabase.server"
import { formatError } from "$lib/utils.js"
import { error, redirect } from "@sveltejs/kit"

export const load = async ({ cookies }) => {
	return { dismissed: cookies.get("warning_dismissed") === "true" }
}

export const actions = {
	clear: async ({ params: { slug }, locals: { getRoles } }) => {
		const roles = await getRoles()
		if (!roles) error(403, "You need to be logged in to clear reports.")
		if (!roles.tester && !roles.moderator && !roles.administrator) {
			error(403, "Only testers, moderators and administrators can clear reports.")
		}
		return { success: await removeScriptBroken(slug) }
	},
	report: async ({ params: { slug }, locals: { user } }) => {
		if (!user) error(403, "You need to be logged in to report a broken script.")
		return { success: await updateReporters(slug, user.id) }
	},

	checkout: async ({
		locals: { supabaseServer, user, getProfile, getSubscriptions, getFreeAccess },
		url: { origin, searchParams }
	}) => {
		if (!user) {
			return await doLogin(supabaseServer, origin, new URLSearchParams("login&provider=discord"))
		}

		const promises = await Promise.all([getProfile(), getSubscriptions(), getFreeAccess()])
		const profile = promises[0]
		const subs = promises[1]
		const free = promises[2]

		if (!profile) {
			return await doLogin(supabaseServer, origin, new URLSearchParams("login&provider=discord"))
		}

		if (!profile.customer_id) {
			const customerSearch = await stripe.customers.search({ query: 'name: "' + profile.id + '"' })

			if (customerSearch.data.length !== 1) {
				error(
					500,
					`You don't seem to have a customer_id assign for some reason. This shouldn't happen and has to be fixed manually.
					Refresh the page, if that doesn't solve the issue please contact support@waspscripts.com and send the following:
					id: ${profile.id} discord_id: ${profile.discord} registered_email: ${user.email} username: ${profile.username}`
				)
			}

			profile.customer_id = customerSearch.data[0].id

			const updateCustomer = await updateCustomerID(profile.id, profile.customer_id)

			if (!updateCustomer) {
				error(
					500,
					`You don't seem to have a customer_id assign for some reason and one couldn't be created. This shouldn't happen and has to be fixed manually.
					Refresh the page, if that doesn't solve the issue please contact support@waspscripts.com and send the following:
					id: ${profile.id} discord_id: ${profile.discord} registered_email: ${user.email}  username: ${profile.username}`
				)
			}
		}

		const productID = searchParams.get("product")
		const priceID = searchParams.get("price")

		if (!productID) {
			error(
				500,
				"Something went wrong! Seems like no product was selected. If this keeps occuring please contact support@waspscripts.com"
			)
		}

		if (!priceID) {
			error(
				500,
				"Something went wrong! Seems like no price was selected. If this keeps occuring please contact support@waspscripts.com"
			)
		}

		if (subs?.find((subscription) => subscription.product === productID)) {
			error(
				500,
				"Something went wrong! Seems like are already subscribed to this product. If this is not the case and this keeps occuring please contact support@waspscripts.com"
			)
		}

		if (free?.find((access) => access.product === productID)) {
			error(
				500,
				"Something went wrong! Seems like already have free access to this product. If this is not the case and this keeps occuring please contact support@waspscripts.com"
			)
		}

		const { data, error: priceErr } = await supabaseServer
			.schema("scripts")
			.from("prices")
			.select("id, products!prices_product_fkey (user_id, stripe_user)")
			.eq("product", productID)
			.eq("id", priceID)
			.eq("active", true)
			.single()

		if (priceErr) {
			error(
				500,
				"Something went wrong! Seems like that price doesn't belong to that product. If this keeps occuring please contact support@waspscripts.com Erorr message:" +
					formatError(priceErr)
			)
		}

		const stripeUser =
			data.products?.user_id !== PUBLIC_SUPER_USER_ID ? data.products?.stripe_user : null

		const url = await createCheckoutSession(
			profile.id,
			profile.customer_id,
			stripeUser ?? null,
			data.id,
			origin
		)

		if (url) redirect(303, url)
		return error(500, "Something went wrong!")
	}
}
