import { STRIPE_KEY } from "$env/static/private"
import type { BundleSchema, NewScriptSchema, PriceSchema } from "$lib/client/schemas"
import type { Bundle, Price, Scripter } from "$lib/types/collection"
import type { SupabaseClient } from "@supabase/supabase-js"
import Stripe from "stripe"

export const stripe = new Stripe(STRIPE_KEY, { apiVersion: "2025-02-24.acacia", typescript: true })

export async function createCustomerPortal(customer: string, origin: string) {
	let portal: Stripe.BillingPortal.Session

	try {
		portal = await stripe.billingPortal.sessions.create({
			customer: customer,
			return_url: origin + "/subscriptions"
		})
	} catch (error) {
		console.error(error)
		return null
	}

	return portal.url
}

export async function createCheckoutSession(
	id: string,
	customer: string,
	stripeUser: string | null,
	price: string,
	origin: string
) {
	let session: Stripe.Checkout.Session

	let currency: string = "eur"
	if (stripeUser) {
		try {
			const start = performance.now()
			const stripeAccount = await stripe.accounts.retrieve(stripeUser)
			currency = stripeAccount.default_currency ?? currency
			console.log(
				`└────🪙 Account currency took ${(performance.now() - start).toFixed(2)} ms to check!`
			)
		} catch (err: unknown) {
			console.error(err)
			return null
		}
	}

	try {
		const start = performance.now()
		session = await stripe.checkout.sessions.create({
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
	} catch (err: unknown) {
		console.error(err)
		return null
	}

	return session.url
}

export async function getStripeConnectAccount(id: string | null | undefined) {
	if (!id) return null
	let stripeAccount: Stripe.Account | null = null

	try {
		stripeAccount = await stripe.accounts.retrieve(id)
	} catch (error) {
		console.error(
			"An error occurred when calling the Stripe API to create an account session",
			error
		)
	}

	return stripeAccount
}

export async function getStripeConnectAccountBalance(id: string | null | undefined) {
	if (!id) return null
	let stripeBalance: Stripe.Balance | null = null
	try {
		stripeBalance = await stripe.balance.retrieve({
			stripeAccount: id
		})
	} catch (error) {
		console.error(
			"An error occurred when calling the Stripe API to create an account session",
			error
		)
	}

	return stripeBalance
}

export async function getStripeSession(account: string | null | undefined) {
	if (!account) return null
	let accountSession: Stripe.Response<Stripe.AccountSession> | null = null

	try {
		accountSession = await stripe.accountSessions.create({
			account: account,
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
	} catch (error) {
		console.error(
			"An error occurred when calling the Stripe API to create an account session",
			error
		)
	}

	return accountSession?.client_secret ?? null
}

export async function createStripeCustomer(
	id: string,
	email: string,
	discord: string,
	username: string
) {
	let customer: Stripe.Customer
	let customerSearch: Stripe.Response<Stripe.ApiSearchResult<Stripe.Customer>>

	try {
		customerSearch = await stripe.customers.search({ query: `name:"${id}"` })
	} catch (error) {
		console.error(error)
		return null
	}

	if (customerSearch.data.length > 1) return false
	if (customerSearch.data.length === 1) return customerSearch.data[0].id

	try {
		customer = await stripe.customers.create({
			email: email,
			name: id,
			metadata: {
				id: id,
				discord_id: discord,
				username: username
			}
		})
	} catch (error) {
		console.error(error)
		return null
	}
	return customer.id
}

export async function createStripeConnectAccount(
	supabase: SupabaseClient,
	baseURL: string,
	scripter: Scripter,
	email: string | undefined,
	country: string
) {
	let account: Stripe.Response<Stripe.Account>
	let accountLink: Stripe.Response<Stripe.AccountLink>

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
		console.error(err)
		return
	}

	const { error: err } = await supabase
		.schema("profiles")
		.from("scripters")
		.update({ stripe: account.id })
		.eq("id", scripter.id)

	if (err) {
		console.error(err)
		return
	}

	try {
		accountLink = await stripe.accountLinks.create({
			account: account.id,
			refresh_url: baseURL + "/api/stripe/connect/reauth",
			return_url: baseURL + "/api/stripe/connect/return",
			type: "account_onboarding"
		})
	} catch (err) {
		console.error(err)
		return
	}

	return accountLink.url
}

export async function finishStripeConnectAccountSetup(baseURL: string, account: string) {
	let accountLink: Stripe.Response<Stripe.AccountLink>

	try {
		accountLink = await stripe.accountLinks.create({
			account: account,
			refresh_url: baseURL + "/api/stripe/connect/reauth",
			return_url: baseURL + "/api/stripe/connect/return",
			type: "account_update"
		})
	} catch (err) {
		console.error(err)
		return
	}

	return accountLink.url
}

export async function updateStripeConnectAccount(id: string, dba: string) {
	try {
		await stripe.accounts.update(id, { business_profile: { name: dba } })
	} catch (error) {
		console.error(
			"An error occurred when calling the Stripe API to create an account session",
			error
		)
		return false
	}

	return true
}

export async function updateStripeProduct(id: string, name: string) {
	try {
		await stripe.products
			.update(id, {
				name: name
			})
			.catch((err: unknown) => console.error(err))
	} catch (err) {
		console.error(err)
	}
}

type Interval = "week" | "month" | "year"

async function createStripePriceEx(product: string, amount: number, interval: Interval) {
	if (amount === 0) return
	await stripe.prices
		.create({
			unit_amount: Math.round(amount * 100),
			currency: "eur",
			active: true,
			product: product,
			recurring: { interval: interval }
		})
		.catch((err: unknown) => console.error(err))
}

export async function createStripePrice(price: PriceSchema, product: string) {
	if (price.amount === 0) return
	await stripe.prices
		.create({
			unit_amount: Math.round(price.amount * 100),
			currency: price.currency,
			active: true,
			product: product,
			recurring: { interval: price.interval as Interval }
		})
		.catch((err: unknown) => console.error(err))
}

export async function updateStripePrice(price: Price) {
	const promises = []

	if (price.amount > 0)
		promises.push(
			stripe.prices.create({
				unit_amount: Math.round(price.amount * 100),
				currency: "EUR",
				active: true,
				product: price.product,
				recurring: { interval: price.interval as Interval }
			})
		)
	promises.push(stripe.prices.update(price.id, { active: false }))

	await Promise.all(promises)
}

export async function createStripeBundleProduct(supabase: SupabaseClient, bundle: BundleSchema) {
	const scripts = bundle.bundledScripts.reduce((acc: string[], script) => {
		if (script.active) acc.push(script.id)
		return acc
	}, [])

	bundle.prices = bundle.prices.filter((price) => price.amount > 0)

	if (bundle.prices.length === 0) return

	const { data, error } = await supabase
		.schema("scripts")
		.from("bundles")
		.insert({ name: bundle.name, user_id: bundle.user_id, scripts: scripts })
		.select()
		.overrideTypes<Bundle[]>()

	if (error) return error

	const product = await stripe.products
		.create({
			name: data[0].name,
			tax_code: "txcd_10202000",
			metadata: { user_id: data[0].user_id, bundle: data[0].id }
		})
		.catch((err: unknown) => console.error(err))

	if (!product) return { message: "Failed to create bundle product in Stripe" }

	const stripePromises: Promise<void>[] = []

	bundle.prices.forEach((price) => {
		if (price.amount) {
			stripePromises.push(createStripePriceEx(product.id, price.amount, price.interval as Interval))
		}
	})

	await Promise.all(stripePromises)
}

export async function createStripeScriptProduct(
	script: NewScriptSchema,
	name: string,
	user_id: string
) {
	script.prices = script.prices.filter((price) => price.amount > 0)
	if (script.prices.length === 0) return

	const product = await stripe.products
		.create({
			name: name,
			tax_code: "txcd_10202000",
			metadata: { user_id: user_id, script: script.id }
		})
		.catch((err: unknown) => console.error(err))

	if (!product) return { message: "Failed to create script product in Stripe" }

	const stripePromises: Promise<void>[] = []

	script.prices.forEach((price) => {
		if (price.amount) {
			stripePromises.push(createStripePriceEx(product.id, price.amount, price.interval as Interval))
		}
	})

	await Promise.all(stripePromises)
}
