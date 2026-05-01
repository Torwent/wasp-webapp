import { transactionDaysSchema } from "$lib/client/schemas"
import { getScripter } from "$lib/client/supabase"
import { stripe } from "$lib/server/stripe.server"
import { UUID_V4_REGEX } from "$lib/utils"
import { error } from "@sveltejs/kit"
import { setError, superValidate } from "sveltekit-superforms"
import { zod } from "sveltekit-superforms/adapters"

const regions = new Intl.DisplayNames(["en"], { type: "region" })

export const actions = {
	default: async ({ request, params: { slug }, locals: { supabaseServer, user, getRoles } }) => {
		if (!user) error(403, "You need to be logged in.")
		if (!UUID_V4_REGEX.test(slug)) error(403, "Invalid dashboard UUID.")

		const promises = await Promise.all([
			getRoles(),
			superValidate(request, zod(transactionDaysSchema)),
			getScripter(supabaseServer, slug)
		])

		const roles = promises[0]
		const form = promises[1]

		if (user.id !== slug && !roles?.administrator)
			error(403, "You cannot access another scripter dashboard.")

		const scripter = promises[2]

		if (!form.valid) return setError(form, "", "The export form is not valid!")

		const since = Math.floor(Date.now() / 1000) - form.data.days * 24 * 60 * 60

		const transactions = await stripe.balanceTransactions
			.list(
				{
					created: { gte: since },
					limit: 100,
					expand: ["data.source.source_transfer.source_transaction"]
				},
				{ stripeAccount: scripter.stripe }
			)
			.autoPagingToArray({ limit: 1000 })
			.then((txs) => {
				const transactions = []
				for (const tx of txs) {
					const transaction = {
						id: tx.id,
						type: tx.type,
						description: tx.description,
						currency: tx.currency,
						created: tx.created,
						amount: tx.amount,
						fee: tx.fee,
						net: tx.net,
						country: ""
					}

					const { source } = tx
					if (!source || typeof source === "string") {
						transactions.push(transaction)
						continue
					}

					if (source.object !== "charge") {
						transactions.push(transaction)
						continue
					}

					const { source_transfer } = source

					if (!source_transfer || typeof source_transfer === "string") {
						transactions.push(transaction)
						continue
					}

					if (source_transfer.object !== "transfer") {
						transactions.push(transaction)
						continue
					}

					const { source_transaction } = source_transfer

					if (!source_transaction || typeof source_transaction === "string") {
						transactions.push(transaction)
						continue
					}

					const {
						billing_details: { address }
					} = source_transaction

					if (address && address.country) {
						transaction.country = regions.of(address.country) ?? ""
					}

					transactions.push(transaction)
				}
				return transactions
			})

		return { form, transactions }
	}
}
