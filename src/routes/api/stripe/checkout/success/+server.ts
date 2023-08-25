import { error, redirect } from "@sveltejs/kit"
import { stripe, updateProfileProtected } from "$lib/backend/supabase.server"
import { getProfile } from "$lib/backend/data.server"
import { API_URL } from "$lib/utils"

export const GET = async ({ fetch, url: { searchParams }, locals: { supabaseServer } }) => {
	const sessionID = searchParams.get("session_id")

	if (!sessionID) {
		console.error("Checkout session id not found. params: " + searchParams.toString())
		throw error(
			403,
			"Something went wrong during checkout! If you got charged please send an email to support@waspscripts.com"
		)
	}
	console.log("Checkout ", sessionID, " was successful!")

	const session = await stripe.checkout.sessions.retrieve(sessionID)
	if (!session.metadata?.id) {
		console.error("Checkout session " + sessionID + " metadata is null.")
		throw error(
			403,
			"Something went wrong during checkout! If you got charged please send an email to support@waspscripts.com"
		)
	}

	console.log("Checkout ", sessionID, " metadata.id: ", session.metadata.id)

	const profile = await getProfile(supabaseServer, session.metadata.id)
	if (!profile) {
		console.error(
			"Checkout session " + sessionID + " profile with id " + session.metadata.id + " not found!"
		)
		throw error(
			403,
			"Something went wrong during checkout! If you got charged please send an email to support@waspscripts.com"
		)
	}

	console.log(
		"Checkout ",
		sessionID,
		" wsid: ",
		profile.id,
		" discord_id: ",
		profile.discord,
		" username: ",
		profile.username
	)

	if (session.status !== "complete") {
		console.error("Checkout session " + sessionID + " status is not complete!")
		throw error(
			402,
			"The payment seem to have failed! If you got charges please contact support@waspscripts.com"
		)
	}

	console.log("Checkout session ", sessionID, " status is complete!")
	if (session.mode === "subscription") {
		if (!session.subscription) {
			console.error("Checkout session " + sessionID + " subscription missing!")
			throw error(
				403,
				"Something went wrong retrieving your subscription! If you got charged please send an email to support@waspscripts.com"
			)
		}

		const subscription = await stripe.subscriptions.retrieve(session.subscription.toString())

		console.log("Checkout subscription data: ", subscription)
		profile.roles.premium = true
		profile.subscriptions.external = false

		profile.subscriptions.date_start = new Date(subscription.start_date * 1000).toISOString()
		profile.subscriptions.date_end = new Date(subscription.current_period_end * 1000).toISOString()

		profile.subscriptions.subscription_id = subscription.id
		profile.subscriptions.cancel = false
		profile.subscriptions.price_id = subscription.items.data[0].price.id
	} else if (session.mode === "payment") {
		console.error(
			"Checkout session " + sessionID + " is a single time payment which is not implemented yet!"
		)
		throw error(403, "NOT IMPLEMENTED YET!")
	}

	await updateProfileProtected(profile)
	fetch(API_URL + "/discord/update/" + profile.discord, {
		method: "GET"
	}).catch((err) => console.error(err))

	throw redirect(303, "/premium")
}
