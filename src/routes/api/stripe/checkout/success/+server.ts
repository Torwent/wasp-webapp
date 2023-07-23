import { error, redirect } from "@sveltejs/kit"
import { updateProfileRoles } from "$lib/backend/supabase.server"
import { getProfile } from "$lib/backend/data.server"

export const GET = async ({ url: { searchParams }, locals: { supabaseServer, stripe } }) => {
	console.log("Checkout")
	const sessionID = searchParams.get("session_id")

	if (!sessionID)
		throw error(
			403,
			"Something went wrong during checkout! If you got charged please send an email to support@waspscripts.com"
		)

	const session = await stripe.checkout.sessions.retrieve(sessionID)
	if (!session.metadata?.id)
		throw error(
			403,
			"Something went wrong during checkout! If you got charged please send an email to support@waspscripts.com"
		)

	const profile = await getProfile(supabaseServer, session.metadata.id)
	if (!profile)
		throw error(
			403,
			"Something went wrong during checkout! If you got charged please send an email to support@waspscripts.com"
		)

	if (session.status === "complete") {
		if (session.mode === "subscription") {
			if (!session.subscription) {
				throw error(
					403,
					"Something went wrong retrieving your subscription! If you got charged please send an email to support@waspscripts.com"
				)
			}

			const subscription = await stripe.subscriptions.retrieve(session.subscription.toString())

			profile.profiles_protected.premium = true
			profile.profiles_protected.subscription_external = false

			profile.profiles_protected.subscription_start = new Date(
				subscription.start_date * 1000
			).toISOString()
			profile.profiles_protected.subscription_end = new Date(
				subscription.current_period_end * 1000
			).toISOString()

			profile.profiles_protected.subscription_id = subscription.id
			profile.profiles_protected.cancel_at_period_end = false
		} else if (session.mode === "payment") {
			throw error(403, "NOT IMPLEMENTED YET!")
		}

		await updateProfileRoles(profile)
	}

	throw redirect(303, "/premium")
}
