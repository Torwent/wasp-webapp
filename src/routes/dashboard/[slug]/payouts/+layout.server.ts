import { stripe } from "$lib/server/stripe.server"

export const load = async ({ url: { searchParams }, parent }) => {
	const cursor = searchParams.get("cursor") || undefined
	const direction = searchParams.get("dir") || "next"

	const { scripter } = await parent()

	const params = {
		limit: 10,
		...(cursor
			? direction === "prev"
				? { ending_before: cursor }
				: { starting_after: cursor }
			: {}),
		expand: ["data.destination"]
	}

	const payoutsPromise = stripe.payouts.list(params, { stripeAccount: scripter.stripe })

	return {
		payoutsPromise,
		direction,
		cursor
	}
}
