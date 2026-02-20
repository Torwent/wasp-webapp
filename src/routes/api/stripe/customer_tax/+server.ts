import {
	STRIPE_INVOICE_TEMPLATE_EU,
	STRIPE_INVOICE_TEMPLATE_NO_EU,
	STRIPE_WEBHOOK_SECRET_CUSTOMER_TAX
} from "$env/static/private"
import { stripe, updateInvoiceTemplate } from "$lib/server/stripe.server"
import { error, json } from "@sveltejs/kit"
import type Stripe from "stripe"

const euCountries = new Set([
	"AT",
	"BE",
	"BG",
	"HR",
	"CY",
	"CZ",
	"DK",
	"EE",
	"FI",
	"FR",
	"DE",
	"GR",
	"HU",
	"IE",
	"IT",
	"LV",
	"LT",
	"LU",
	"MT",
	"NL",
	"PL",
	"PT",
	"RO",
	"SK",
	"SI",
	"ES",
	"SE"
])

export const POST = async ({ request }) => {
	const sig = request.headers.get("stripe-signature") ?? ""
	let event: Stripe.Event

	const body = await request.text()

	try {
		event = stripe.webhooks.constructEvent(body, sig, STRIPE_WEBHOOK_SECRET_CUSTOMER_TAX)
	} catch (err) {
		console.log(err)
		error(404, "Event is not valid! Body: " + body + " Error: " + err)
	}

	const { data, type } = event

	console.log(type)

	switch (type) {
		case "customer.tax_id.created": {
			const { object: tax } = data
			if (!tax.customer) break

			if (tax.country == null || euCountries.has(tax.country.toUpperCase())) {
				await updateInvoiceTemplate(tax.customer as string, STRIPE_INVOICE_TEMPLATE_EU)
			} else {
				await updateInvoiceTemplate(tax.customer as string, STRIPE_INVOICE_TEMPLATE_NO_EU)
			}
			break
		}

		case "customer.tax_id.updated": {
			const { object: tax } = data
			if (!tax.customer) break

			if (tax.country == null || euCountries.has(tax.country.toUpperCase())) {
				await updateInvoiceTemplate(tax.customer as string, STRIPE_INVOICE_TEMPLATE_EU)
			} else {
				await updateInvoiceTemplate(tax.customer as string, STRIPE_INVOICE_TEMPLATE_NO_EU)
			}
			break
		}

		case "customer.tax_id.deleted": {
			const tax = data.object
			if (!tax.customer) break
			if (tax.country == null || euCountries.has(tax.country.toUpperCase())) {
				await updateInvoiceTemplate(tax.customer as string, STRIPE_INVOICE_TEMPLATE_EU)
			} else {
				await updateInvoiceTemplate(tax.customer as string, STRIPE_INVOICE_TEMPLATE_NO_EU)
			}
			break
		}

		default:
			error(404, "Subscription event doesn't have a valid type! Type: " + type)
	}

	return json({ success: "true" })
}
