import { transactionDaysSchema } from "$lib/client/schemas"
import { stripe } from "$lib/server/stripe.server"
import { superValidate } from "sveltekit-superforms"
import { zod } from "sveltekit-superforms/adapters"

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
		expand: ["data.source"]
	}

	const transactionsPromise = stripe.balanceTransactions.list(params, {
		stripeAccount: scripter.stripe
	})

	const daysForm = await superValidate({ days: 30 }, zod(transactionDaysSchema))

	return {
		daysForm,
		transactionsPromise,
		direction,
		cursor
	}
}
