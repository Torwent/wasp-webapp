import { stripe } from "$lib/server/stripe.server"
import { error } from "@sveltejs/kit"

const regions = new Intl.DisplayNames(["en"], { type: "region" })

export const load = async ({ params, parent }) => {
	const { scripter } = await parent()

	const tx = await stripe.balanceTransactions
		.retrieve(
			params.transaction,
			{
				expand: ["source.source_transfer.source_transaction.customer"]
			},
			{ stripeAccount: scripter.stripe }
		)
		.catch(() => {
			error(500, "Failed to find transaction: " + params.transaction)
		})

	const transaction = {
		id: tx.id,
		amount: tx.amount,
		fee: tx.fee,
		net: tx.net,
		currency: tx.currency,
		created: tx.created,
		available_on: tx.available_on
	}

	const user = {
		stripe: "",
		waspscripts: "",
		discord: "",
		country: "",
		refunds: 0
	}

	const { source } = tx
	if (!source || typeof source === "string") {
		return { transaction, source: source ?? "", charge: "", user }
	}

	if (source.object !== "charge") {
		return { transaction, source: source.id, charge: "", user }
	}

	const { source_transfer } = source
	if (!source_transfer || typeof source_transfer === "string") {
		return { transaction, source: source.id, charge: "", user }
	}

	const { source_transaction } = source_transfer
	if (!source_transaction || typeof source_transaction === "string") {
		return { transaction, source: source.id, charge: source_transaction ?? "", user }
	}

	const {
		billing_details: { address }
	} = source_transaction

	if (address && address.country) {
		user.country = regions.of(address.country) ?? ""
	}

	const { customer } = source_transaction

	if (!customer || typeof customer === "string") {
		user.stripe = customer ?? ""
		return { transaction, source: source.id, charge: source_transaction ?? "", user }
	}

	user.stripe = customer.id

	if (customer.deleted) {
		return { transaction, source: source.id, charge: source_transaction ?? "", user }
	}

	user.waspscripts = customer.metadata["id"]
	user.discord = customer.metadata["discord_id"]

	return {
		transaction,
		source: source.id,
		charge: source_transaction.id,
		user
	}
}
