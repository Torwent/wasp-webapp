import type {
	Bundle,
	Interval,
	Price,
	Profile,
	Script,
	ScriptBase,
	ScripterDashboard,
	ScripterWithProfile
} from "$lib/types/collection"
import { pad, profileQuery } from "$lib/utils"
import type { Provider, SupabaseClient } from "@supabase/supabase-js"
import { error, redirect } from "@sveltejs/kit"
import { stripe } from "./supabase.server"
import type { BundleSchema, NewScriptSchema, PriceSchema } from "./schemas"
import type Stripe from "stripe"

export async function doLogin(
	supabase: SupabaseClient,
	origin: string,
	searchParams: URLSearchParams
) {
	const provider = searchParams.get("provider") as Provider

	if (provider) {
		const { data, error: err } = await supabase.auth.signInWithOAuth({
			provider: provider,
			options: {
				redirectTo: origin + "/api/auth/callback/",
				scopes: "identify email guilds guilds.members.read"
			}
		})

		if (err) {
			console.error("Login failed: " + err.message)
			throw error(400, { message: "Something went wrong logging you in!" })
		}

		throw redirect(303, data.url)
	}

	throw error(403, "Failed to login! Provider not specified!")
}

function updateID(str: string, id: string) {
	const regex = /{\$DEFINE SCRIPT_ID := '(.*?)'}/
	const replace = "{$DEFINE SCRIPT_ID := '" + id + "'}"
	str = str.match(regex) ? str.replace(regex, replace) : replace.concat("\n").concat(str)

	return str
}

function updateRevision(str: string, rev: number) {
	const regex = /{\$DEFINE SCRIPT_REVISION := '(.*?)'}/
	const replace = "{$DEFINE SCRIPT_REVISION := '" + rev.toString() + "'}"
	str = str.match(regex) ? str.replace(regex, replace) : replace.concat("\n").concat(str)

	return str
}

async function updateScriptFile(file: File, id: string, revision: number) {
	let fileString = await file.text()
	fileString = updateID(updateRevision(fileString, revision), id)

	return new File([fileString], file.name, { type: "text/plain" })
}

async function uploadFile(supabase: SupabaseClient, bucket: string, path: string, file: File) {
	const { error: err } = await supabase.storage.from(bucket).upload(path, file, { upsert: true })
	if (err) {
		const msg = "storage " + bucket + " UPLOAD " + path + " failed with the following error: "
		console.error(msg + JSON.stringify(err))
		return err
	}
}

export async function uploadScript(
	supabase: SupabaseClient,
	script: ScriptBase,
	scriptFile: File | undefined,
	coverFile: File | undefined,
	bannerFile: File | undefined
) {
	console.log("📜 Uploading ", script.title)
	if (!scriptFile) {
		console.error("Script file is missing!")
		return { error: "Script file is missing!" }
	}

	if (!coverFile) {
		console.error("Cover image is missing!")
		return { error: "Cover image is missing!" }
	}

	if (!bannerFile) {
		console.error("Banner image is missing!")
		return { error: "Banner image is missing!" }
	}

	const publicData = {
		title: script.title,
		description: script.description,
		content: script.content,
		categories: script.categories,
		subcategories: script.subcategories,
		min_xp: script.min_xp,
		max_xp: script.max_xp,
		min_gp: script.min_gp,
		max_gp: script.max_gp
	}

	const { data, error } = await supabase
		.schema("scripts")
		.from("scripts")
		.insert(publicData)
		.select("id, url")
		.returns<ScriptBase[]>()

	if (error) {
		console.log("scripts.scripts INSERT failed: ")
		console.error(error)
		return { error: JSON.stringify(error) }
	}

	script.id = data[0].id

	scriptFile = await updateScriptFile(scriptFile, script.id as string, 1)

	//rename all scripts to script so we can always fetch them later regardless of name changes.
	const path = script.id + "/" + pad(1, 9) + "/script.simba"

	const promises = await Promise.all([
		uploadFile(supabase, "scripts", path, scriptFile),
		uploadFile(supabase, "imgs", "scripts/" + script.id + "/cover.jpg", coverFile),
		uploadFile(supabase, "imgs", "scripts/" + script.id + "/banner.jpg", bannerFile)
	])

	let err: string | undefined

	for (let i = 0; i < promises.length; i++) {
		if (promises[i]) {
			err = "File upload failed " + JSON.stringify(promises[i])
			break
		}
	}

	return { url: data[0].url, error: err }
}

export async function updateScript(
	supabase: SupabaseClient,
	script: Script,
	scriptFile: File | undefined,
	coverFile: File | undefined,
	bannerFile: File | undefined
) {
	console.log("📜 Updating ", script.title, " by ", script.protected.username, " id: ", script.id)

	const publicData = {
		title: script.title,
		description: script.description,
		content: script.content,
		categories: script.categories,
		subcategories: script.subcategories,
		min_xp: script.min_xp,
		max_xp: script.max_xp,
		min_gp: script.min_gp,
		max_gp: script.max_gp,
		published: script.published
	}

	const { error } = await supabase
		.schema("scripts")
		.from("scripts")
		.update(publicData)
		.eq("id", script.id)

	if (error) {
		console.log("scripts.scripts UPDATE failed: ")
		console.error(error)
		return { error: JSON.stringify(error) }
	}

	const promises = []

	if (scriptFile) {
		const revision = script.protected.revision + 1
		console.log("Updating script revision to ", revision)
		scriptFile = await updateScriptFile(scriptFile, script.id as string, revision)
		const path = script.id + "/" + pad(revision, 9) + "/script.simba"
		promises.push(uploadFile(supabase, "scripts", path, scriptFile))
	}

	if (coverFile) {
		console.log("Updating script cover")
		promises.push(uploadFile(supabase, "imgs", "scripts/" + script.id + "/cover.jpg", coverFile))
	}
	if (bannerFile) {
		console.log("Updating script banner")
		promises.push(uploadFile(supabase, "imgs", "scripts/" + script.id + "/banner.jpg", bannerFile))
	}

	const awaitedPromises = promises.length > 0 ? await Promise.all(promises) : []
	let err: string | undefined
	for (let i = 0; i < awaitedPromises.length; i++) {
		if (awaitedPromises[i]) {
			err = "File upload failed " + JSON.stringify(promises[i])
			break
		}
	}

	return { error: err }
}

export async function getSignedURLServer(
	supabase: SupabaseClient,
	bucket: string,
	path: string,
	file: string
) {
	path += "/" + file

	const { data, error: err } = await supabase.storage.from(bucket).createSignedUrl(path, 10)
	if (err)
		throw error(
			401,
			`Server error, this is probably not an issue on your end! - Get sign url for ${bucket} to ${bucket} failed!
			Error name: ${err.name}
			Error message: ${err.message}
			Error cause: ${err.cause}
			Error stack: ${err.stack}`
		)
	return data.signedUrl
}

export async function getProfile(supabase: SupabaseClient, id: string) {
	const { data, error } = await supabase
		.schema("profiles")
		.from("profiles")
		.select(profileQuery)
		.eq("id", id)
		.limit(1)
		.limit(1, { foreignTable: "private" })
		.limit(1, { foreignTable: "roles" })
		.returns<Profile[]>()

	if (error || data.length < 1) return null
	return data[0]
}

export async function userControlsProduct(supabase: SupabaseClient, id: string, product: string) {
	const { data, error } = await supabase
		.schema("scripts")
		.from("products")
		.select("id, user_id")
		.single()

	if (error) return false
	return product === data.id && id === data.user_id
}

export async function addFreeAccess(
	supabase: SupabaseClient,
	id: string,
	product: string,
	date_end: string
) {
	const { data, error } = await supabase
		.schema("profiles")
		.from("free_access")
		.insert({ product: product, id: id, date_end: date_end })

	return error
}

export async function cancelFreeAccess(supabase: SupabaseClient, id: string, product: string) {
	const { error } = await supabase
		.schema("profiles")
		.from("free_access")
		.delete()
		.eq("id", id)
		.eq("product", product)

	return error
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

export async function createCheckoutSession(
	id: string,
	customer: string,
	stripeUser: string | null,
	price: string,
	origin: string
) {
	let session: Stripe.Checkout.Session

	try {
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
				application_fee_percent: stripeUser ? 20 : undefined,
				transfer_data: stripeUser ? { destination: stripeUser } : undefined,
				metadata: { user_id: id }
			},
			success_url: origin + "/api/stripe/checkout/success?session_id={CHECKOUT_SESSION_ID}",
			cancel_url: origin + "/api/stripe/checkout/cancel?session_id={CHECKOUT_SESSION_ID}"
		})
	} catch (err: any) {
		console.error(err)
		return null
	}

	return session.url
}

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

export async function createStripeConnectAccount(
	supabase: SupabaseClient,
	baseURL: string,
	scripter: ScripterDashboard,
	country: string
) {
	let account: Stripe.Response<Stripe.Account>
	let accountLink: Stripe.Response<Stripe.AccountLink>

	try {
		account = await stripe.accounts.create({
			type: "custom",
			country: country,
			email: scripter.profiles.private.email,
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
				payouts: { schedule: { interval: "weekly", delay_days: 7, weekly_anchor: "monday" } }
			}
		})
	} catch (error) {
		console.error(error)
		return
	}

	console.log(account)

	const { error } = await supabase
		.schema("profiles")
		.from("scripters")
		.update({ stripe: account.id })
		.eq("id", scripter.id)

	if (error) {
		console.error(error)
		return
	}

	try {
		accountLink = await stripe.accountLinks.create({
			account: account.id,
			refresh_url: baseURL + "/api/stripe/connect/reauth",
			return_url: baseURL + "/api/stripe/connect/return",
			type: "account_onboarding"
		})
	} catch (error) {
		console.error(error)
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
	} catch (error) {
		console.error(error)
		return
	}

	return accountLink.url
}

export async function getStripeConnectAccount(id: string) {
	let stripeAccount: Stripe.Account | null = null

	try {
		stripeAccount = await stripe.accounts.retrieve(id)
	} catch (error) {
		console.error(
			"An error occurred when calling the Stripe API to create an account session",
			error
		)
	}

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

	return { stripeAccount, stripeBalance }
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

export async function getStripeSession(account: string) {
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

	return accountSession?.client_secret
}

export async function StripeAccount(baseURL: string, developer: ScripterWithProfile) {
	let accountLink: Stripe.Response<Stripe.AccountLink>

	if (!developer.stripe) return

	try {
		accountLink = await stripe.accountLinks.create({
			account: developer.stripe,
			refresh_url: baseURL + "/api/stripe/connect/reauth",
			return_url: baseURL + "/api/stripe/connect/return",
			type: "account_update"
		})
		return accountLink.url
	} catch (error) {
		console.error(error)
		return
	}
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
		.catch((error) => console.error(error.raw.message))
}

export async function createStripePriceEx(product: string, amount: number, interval: Interval) {
	if (amount === 0) return
	await stripe.prices
		.create({
			unit_amount: Math.round(amount * 100),
			currency: "eur",
			active: true,
			product: product,
			recurring: { interval: interval }
		})
		.catch((error) => console.error(error.raw.message))
}

export async function updateStripePriceEx(price: Price, amount: number) {
	if (price.amount === amount) return

	await Promise.all([
		stripe.prices
			.create({
				unit_amount: Math.round(amount * 100),
				currency: "EUR",
				active: true,
				product: price.product,
				recurring: { interval: price.interval as Interval }
			})
			.catch((error) => console.error(error.raw.message)),
		stripe.prices
			.update(price.id, { active: false })
			.catch((error) => console.error(error.raw.message))
	])
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
		.returns<Bundle[]>()

	if (error) return error

	const product = await stripe.products
		.create({
			name: data[0].name,
			tax_code: "txcd_10202000",
			metadata: { user_id: data[0].user_id, bundle: data[0].id }
		})
		.catch((error) => console.error(error.raw.message))

	if (!product) return { message: "Failed to create bundle product in Stripe" }

	const stripePromises: Promise<void>[] = []

	bundle.prices.forEach((price) => {
		if (Boolean(price.amount)) {
			stripePromises.push(createStripePriceEx(product.id, price.amount, price.interval as Interval))
		}
	})

	await Promise.all(stripePromises)
}

export async function createStripeScriptProduct(script: NewScriptSchema, user_id: string) {
	script.prices = script.prices.filter((price) => price.amount > 0)
	if (script.prices.length === 0) return

	const product = await stripe.products
		.create({
			name: script.name,
			tax_code: "txcd_10202000",
			metadata: { user_id: user_id, script: script.id }
		})
		.catch((error) => console.error(error.raw.message))

	if (!product) return { message: "Failed to create script product in Stripe" }

	const stripePromises: Promise<void>[] = []

	script.prices.forEach((price) => {
		if (Boolean(price.amount)) {
			stripePromises.push(createStripePriceEx(product.id, price.amount, price.interval as Interval))
		}
	})

	await Promise.all(stripePromises)
}

export async function updateStripeProduct(id: string, name: string) {
	await stripe.products
		.update(id, {
			name: name
		})
		.catch((error) => console.error(error.raw.message))
}
