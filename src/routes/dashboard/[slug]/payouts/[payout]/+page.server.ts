import { stripe } from "$lib/server/stripe.server"
import { error } from "@sveltejs/kit"

const regions = new Intl.DisplayNames(["en"], { type: "region" })

export const load = async ({ params, parent }) => {
	const { scripter } = await parent()

	const payoutPromise = stripe.payouts
		.retrieve(params.payout, { expand: ["destination"] }, { stripeAccount: scripter.stripe })
		.catch((e) => {
			console.log(e)
			error(500, "Failed to fetch payout details.")
		})

	const transactionsPromise = stripe.balanceTransactions
		.list(
			{
				payout: params.payout,
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

	return {
		payoutPromise,
		transactionsPromise
	}
}
