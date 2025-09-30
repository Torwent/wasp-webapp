import { STRIPE_WEBHOOK_SECRET_DISPUTES } from "$env/static/private"
import { stripe } from "$lib/server/stripe.server"
import { supabaseAdmin } from "$lib/server/supabase.server"
import { formatError } from "$lib/utils"
import { error, json } from "@sveltejs/kit"
import type Stripe from "stripe"

export const POST = async ({ request }) => {
	const sig = request.headers.get("stripe-signature") ?? ""
	let event: Stripe.Event

	const body = await request.text()

	try {
		event = stripe.webhooks.constructEvent(body, sig, STRIPE_WEBHOOK_SECRET_DISPUTES)
	} catch (err) {
		console.log(err)
		error(404, "Event is not valid! Body: " + body + " Error: " + err)
	}

	const { data, type } = event

	if (type !== "charge.dispute.closed")
		error(404, "Dispute event doesn't have a valid type! Type: " + type)

	const dispute = data.object as Stripe.Dispute
	if (dispute.status != "lost") return json({ success: "true" })

	console.log(dispute)

	let { balance_transactions: transactions, charge: chargeID } = dispute

	const charge = await stripe.charges.retrieve(chargeID as string)
	if (!charge.on_behalf_of) return json({ success: "true" })

	const account = charge.on_behalf_of as string

	const { data: balance, error: err } = await supabaseAdmin
		.schema("profiles")
		.from("balances")
		.select("balance")
		.eq("stripe", account)
		.single()

	if (err) {
		error(500, "SELECT profiles.balances error" + formatError(err))
	}

	const urlBase = "https://api.fxratesapi.com/latest?base=eur&"
	const urlTail = "&resolution=1m&amount=1&places=6&format=json"

	let currencies = "currencies="
	const values = []
	const symbols = new Set()

	for (let i = 0; i < transactions.length; i++) {
		const { net, currency } = transactions[i]
		if (net >= 0) continue

		symbols.add(currency)
		values.push({ currency, amount: Math.abs(net + Math.round(net * 0.014)) }) //add debit fee
	}

	currencies += [...symbols].join(",")
	const url = urlBase + currencies + urlTail

	let requestData: any

	try {
		const response = await fetch(url)
		requestData = await response.json()
	} catch (e) {
		error(500, "Error:" + JSON.stringify(e))
	}

	for (let i = 0; i < values.length; i++) {
		const rate = requestData.rates[values[i].currency]
		if (!rate) error(500, `No rate for ${values[i].currency}`)
		balance.balance += values[i].amount / rate
	}

	const { error: errUpdate } = await supabaseAdmin
		.schema("profiles")
		.from("balances")
		.update(balance)
		.eq("stripe", account)

	if (errUpdate) {
		error(500, "UPDATE profiles.balances error" + formatError(errUpdate))
	}

	return json({ success: "true" })
}
