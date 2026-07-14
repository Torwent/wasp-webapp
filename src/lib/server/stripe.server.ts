import { STRIPE_KEY } from "$env/static/private"
import type { BundleSchema, NewScriptSchema, PriceSchema } from "$lib/client/schemas"
import type { Bundle, Price, Scripter } from "$lib/types/collection"
import type { SupabaseClient } from "@supabase/supabase-js"
import Stripe from "stripe"

export const stripe = new Stripe(STRIPE_KEY, { apiVersion: "2026-03-25.dahlia", typescript: true })

export async function createCustomerPortal(customer: string, origin: string) {
	try {
		const portal = await stripe.billingPortal.sessions.create({
			customer: customer,
			return_url: origin + "/subscriptions"
		})
		return portal.url
	} catch (err) {
		console.error(
			"createCustomerPortal error on stripe.billingPortal.sessions.create: " + JSON.stringify(err)
		)
		return null
	}
}

export async function createCheckoutSession(
	id: string,
	customer: string,
	stripeUser: string | null,
	price: string,
	origin: string
) {
	let currency: string = "eur"

	if (stripeUser) {
		const start = performance.now()
		try {
			const stripeAccount = await stripe.accounts.retrieve(stripeUser)
			currency = stripeAccount.default_currency ?? currency
		} catch (err) {
			console.error(
				"createCheckoutSession error on stripe.accounts.retrieve: " + JSON.stringify(err)
			)
			return null
		}

		console.log(
			`└────🪙 Account currency took ${(performance.now() - start).toFixed(2)} ms to check!`
		)
	}

	const start = performance.now()
	try {
		const session = await stripe.checkout.sessions.create({
			line_items: [{ price: price, quantity: 1 }],
			customer: customer,
			customer_update: { address: "auto", shipping: "auto" },
			mode: "subscription",
			billing_address_collection: "auto",
			automatic_tax: { enabled: stripeUser == null },
			payment_method_collection: "always",
			allow_promotion_codes: true,
			subscription_data: {
				on_behalf_of: stripeUser ?? undefined,
				application_fee_percent: stripeUser ? (currency === "eur" ? 20 : 22) : undefined,
				transfer_data: stripeUser ? { destination: stripeUser } : undefined,
				metadata: { user_id: id }
			},
			success_url: origin + "/subscriptions/success?session_id={CHECKOUT_SESSION_ID}",
			cancel_url: origin + "/subscriptions/cancel?session_id={CHECKOUT_SESSION_ID}"
		})
		console.log(
			`└────🛒 Checkout session took ${(performance.now() - start).toFixed(2)} ms to create!`
		)

		return session.url
	} catch (err) {
		console.error(
			"createCheckoutSession error on stripe.checkout.sessions.create: " + JSON.stringify(err)
		)
		return null
	}
}

export async function getStripeConnectAccount(id: string | undefined) {
	if (id == null) return null

	try {
		const stripeAccount = await stripe.accounts.retrieve(id)
		return stripeAccount as Stripe.Account
	} catch (err) {
		console.error(
			"getStripeConnectAccount error on stripe.accounts.retrieve: " + JSON.stringify(err)
		)
		return null
	}
}

export async function getStripeSession(id: string | undefined) {
	if (id == null) return null

	try {
		const accountSession = await stripe.accountSessions.create({
			account: id,
			components: {
				payments: {
					enabled: true,
					features: {
						refund_management: true,
						dispute_management: true,
						capture_payments: true
					}
				},
				payouts: {
					enabled: true
				},
				payment_details: {
					enabled: true,
					features: { refund_management: true, capture_payments: true, dispute_management: true }
				}
			}
		})
		return accountSession.client_secret
	} catch (err) {
		console.error("getStripeSession error on stripe.accountSessions.create: " + JSON.stringify(err))
		return null
	}
}

export async function createStripeCustomer(
	id: string,
	email: string,
	discord: string,
	username: string
) {
	let customerSearch: Stripe.Response<Stripe.ApiSearchResult<Stripe.Customer>>

	try {
		customerSearch = await stripe.customers.search({ query: `name:"${id}"` })
	} catch (err) {
		console.error("createStripeCustomer error on stripe.customers.search: " + JSON.stringify(err))
		return null
	}

	if (customerSearch.data.length > 1) return null
	if (customerSearch.data.length === 1) return customerSearch.data[0].id

	try {
		const customer = await stripe.customers.create({
			email: email,
			name: id,
			metadata: {
				id: id,
				discord_id: discord,
				username: username
			}
		})
		return customer.id
	} catch (err) {
		console.error("createStripeCustomer error on stripe.customers.create: " + JSON.stringify(err))
		return null
	}
}

export async function createStripeConnectAccount(
	supabase: SupabaseClient,
	baseURL: string,
	scripter: Scripter,
	email: string | undefined,
	country: string
) {
	let account: Stripe.Response<Stripe.Account>

	try {
		account = await stripe.accounts.create({
			type: "custom",
			country: country,
			email: email,
			business_type: "individual",
			individual: { full_name_aliases: [scripter.id, scripter.profiles.username] },
			capabilities: {
				card_payments: { requested: true },
				link_payments: { requested: true },
				transfers: { requested: true }
			},
			business_profile: {
				mcc: "5734",
				name: scripter.profiles.username,
				support_url: "https://waspscripts.com/scripters/" + scripter.url,
				url: "https://waspscripts.com/scripters/" + scripter.url,
				support_email: "support@waspscripts.com"
			},
			metadata: { id: scripter.id, username: scripter.profiles.username },
			settings: {
				payouts: {
					schedule: { interval: "monthly", delay_days: 15, monthly_anchor: 31 },
					statement_descriptor: "waspscripts.com"
				}
			}
		})
	} catch (err) {
		console.error(
			"createStripeConnectAccount error on stripe.accounts.create: " + JSON.stringify(err)
		)
		return null
	}

	const promises = await Promise.all([
		supabase
			.schema("profiles")
			.from("scripters")
			.update({ stripe: account.id })
			.eq("id", scripter.id),
		supabase
			.schema("profiles")
			.from("balances")
			.update({ stripe: account.id })
			.eq("id", scripter.id)
	])

	for (let i = 0; i < promises.length; i++) {
		if (promises[i].error) {
			console.error(
				"createStripeConnectAccount error on supabase: " + JSON.stringify(promises[i].error)
			)
			return null
		}
	}

	try {
		const accountLink = await stripe.accountLinks.create({
			account: account.id,
			refresh_url: baseURL + "/dashboard",
			return_url: baseURL + "/dashboard",
			type: "account_onboarding"
		})

		return accountLink.url
	} catch (err) {
		console.error(
			"createStripeConnectAccount error on stripe.accountLinks.create: " + JSON.stringify(err)
		)
		return null
	}
}

export async function finishStripeConnectAccountSetup(baseURL: string, account: string) {
	try {
		const accountLink = await stripe.accountLinks.create({
			account: account,
			refresh_url: baseURL + "/api/stripe/connect/reauth",
			return_url: baseURL + "/api/stripe/connect/return",
			type: "account_update"
		})
		return accountLink.url
	} catch (err) {
		console.error("finishStripeConnectAccountSetup error: " + JSON.stringify(err))
		return null
	}
}

export async function updateStripeConnectAccount(id: string, dba: string) {
	try {
		await stripe.accounts.update(id, { business_profile: { name: dba } })
	} catch (err) {
		console.error("updateStripeConnectAccount error: " + JSON.stringify(err))
		return false
	}

	return true
}

export async function updateInvoiceTemplate(customer: string, template: string) {
	try {
		await stripe.customers.update(customer, {
			invoice_settings: {
				rendering_options: { template }
			}
		})
	} catch (err) {
		console.error("Error updating user invoice template: " + JSON.stringify(err))
		return false
	}
	return true
}

export async function updateStripeProduct(id: string, name: string) {
	try {
		await stripe.products.update(id, { name: name })
	} catch (err) {
		console.error(
			`Error updating product: ${id} with name: ${name} and error: ` + JSON.stringify(err)
		)
		return false
	}
	return true
}

type Interval = "week" | "month" | "year"

async function createStripePriceEx(product: string, amount: number, interval: Interval) {
	if (amount === 0) return true

	try {
		await stripe.prices.create({
			unit_amount: Math.round(amount * 100),
			currency: "eur",
			active: true,
			product: product,
			recurring: { interval: interval }
		})
	} catch (err) {
		console.error(
			`Error creating priceEx: ${product} with amount: ${amount}, interval: ${interval} and error: ` +
				JSON.stringify(err)
		)
		return false
	}
	return true
}

export async function createStripePrice(price: PriceSchema, product: string) {
	if (price.amount === 0) return true

	try {
		await stripe.prices.create({
			unit_amount: Math.round(price.amount * 100),
			currency: price.currency,
			active: true,
			product: product,
			recurring: { interval: price.interval as Interval }
		})
	} catch (err) {
		console.error(
			`Error creating price for product: ${product} with price: ${JSON.stringify(price)} and error: ` +
				JSON.stringify(err)
		)
		return false
	}

	return true
}

export async function updateStripePrice(price: Price) {
	if (price.amount > 0) {
		try {
			await stripe.prices.create({
				unit_amount: Math.round(price.amount * 100),
				currency: "EUR",
				active: true,
				product: price.product,
				recurring: { interval: price.interval as Interval }
			})
		} catch (err) {
			console.error(
				`Error updating price on create: ${JSON.stringify(price)} and error: ` + JSON.stringify(err)
			)
			return false
		}
	}

	try {
		await stripe.prices.update(price.id, { active: false })
	} catch (err) {
		console.error(
			`Error updating price on update: ${JSON.stringify(price)} and error: ` + JSON.stringify(err)
		)
		return false
	}

	return true
}

export async function createStripeBundleProduct(supabase: SupabaseClient, bundle: BundleSchema) {
	const scripts = bundle.bundledScripts.reduce((acc: string[], script) => {
		if (script.active) acc.push(script.id)
		return acc
	}, [])

	bundle.prices = bundle.prices.filter((price) => price.amount > 0)

	if (bundle.prices.length === 0) return { message: null }

	const { data, error: err } = await supabase
		.schema("scripts")
		.from("bundles")
		.insert({ name: bundle.name, user_id: bundle.user_id, scripts: scripts })
		.select()
		.overrideTypes<Bundle[]>()

	if (err) return err

	let product: Stripe.Product

	try {
		product = await stripe.products.create({
			name: data[0].name,
			tax_code: "txcd_10202000",
			metadata: { user_id: data[0].user_id, bundle: data[0].id }
		})
	} catch (err) {
		console.error(
			`createStripeBundleProduct error on stripe.products.create with data: ${JSON.stringify(data)} and error: ` +
				JSON.stringify(err)
		)
		return { message: "Failed to create bundle product in Stripe" }
	}

	const promises = []

	for (let i = 0; i < bundle.prices.length; i++) {
		const price = bundle.prices[i]
		if (price.interval === "year" || price.interval === "month") continue
		promises.push(createStripePriceEx(product.id, price.amount, price.interval as Interval))
	}

	const results = await Promise.all(promises)
	for (let i = 0; i < results.length; i++) {
		if (!results[i]) return { message: "Failed to create a price" }
	}
	return { message: null }
}

export async function createStripeScriptProduct(
	script: NewScriptSchema,
	name: string,
	user_id: string
) {
	script.prices = script.prices.filter((price) => price.amount > 0)
	if (script.prices.length === 0) return { message: null }

	const product = await stripe.products
		.create({
			name: name,
			tax_code: "txcd_10202000",
			metadata: { user_id: user_id, script: script.id }
		})
		.catch((err: unknown) => console.error(err))

	if (!product) return { message: "Failed to create script product in Stripe" }

	const promises = []

	for (let i = 0; i < script.prices.length; i++) {
		const price = script.prices[i]
		if (price.interval === "year" || price.interval === "month") continue
		promises.push(createStripePriceEx(product.id, price.amount, price.interval as Interval))
	}

	const results = await Promise.all(promises)
	for (let i = 0; i < results.length; i++) {
		if (!results[i]) return { message: "Failed to create a price" }
	}
	return { message: null }
}
