import { error, redirect } from "@sveltejs/kit"
import { stripe } from "$lib/server/stripe.server"

export const GET = async ({ url: { searchParams } }) => {
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
	} else if (session.mode === "payment") {
		console.error(
			"Checkout session " + sessionID + " is a single time payment which is not implemented yet!"
		)
		throw error(403, "NOT IMPLEMENTED YET!")
	}

	throw redirect(303, "/subscriptions")
}
