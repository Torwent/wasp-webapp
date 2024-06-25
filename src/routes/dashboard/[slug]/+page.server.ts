import { doLogin } from "$lib/server/supabase.server"
import {
	bundleArraySchema,
	countryCodeSchema,
	dbaSchema,
	newBundleSchema,
	newScriptArraySchema,
	scriptArraySchema
} from "$lib/client/schemas"
import { UUID_V4_REGEX, formatError } from "$lib/utils"
import { error, fail, redirect } from "@sveltejs/kit"
import { setError, superValidate } from "sveltekit-superforms/server"
import { zod } from "sveltekit-superforms/adapters"
import { getScripter } from "$lib/client/supabase"
import {
	stripe,
	createStripeConnectAccount,
	finishStripeConnectAccountSetup,
	getStripeConnectAccount,
	getStripeConnectAccountBalance,
	getStripeSession,
	updateStripeConnectAccount,
	updateStripeProduct,
	updateStripePrice,
	createStripeBundleProduct,
	createStripePrice,
	createStripeScriptProduct
} from "$lib/server/stripe.server"
import { addFreeAccess, cancelFreeAccess } from "$lib/server/supabase.server"

export const load = async ({
	params: { slug },
	locals: { supabaseServer, user, getRoles },
	depends
}) => {
	if (!user) error(403, "You need to be logged in.")
	if (!UUID_V4_REGEX.test(slug)) error(403, "Invalid dashboard UUID.")

	if (user.id !== slug) {
		const roles = await getRoles()
		if (!roles?.administrator) error(403, "You cannot access another scripter dashboard.")
	}

	const promises = await Promise.all([
		superValidate(zod(countryCodeSchema)),
		superValidate(zod(dbaSchema)),
		superValidate(zod(bundleArraySchema)),
		superValidate(zod(newBundleSchema)),
		superValidate(zod(scriptArraySchema)),
		superValidate(zod(newScriptArraySchema))
	])

	depends("dashboard:stripe_session")

	const scripter = await getScripter(supabaseServer, slug)

	return {
		forms: {
			country: promises[0],
			dba: promises[1],
			bundles: promises[2],
			newBundle: promises[3],
			scripts: promises[4],
			newScript: promises[5]
		},
		stripeData: {
			account: scripter.stripe ? getStripeConnectAccount(scripter.stripe) : null,
			balance: scripter.stripe ? getStripeConnectAccountBalance(scripter.stripe) : null,
			session: scripter.stripe ? getStripeSession(scripter.stripe) : null
		}
	}
}

export const actions = {
	createStripe: async ({
		request,
		locals: { supabaseServer, user, getRoles },
		url: { origin },
		params: { slug }
	}) => {
		if (!user)
			return await doLogin(supabaseServer, origin, new URLSearchParams("login&provider=discord"))

		if (!UUID_V4_REGEX.test(slug)) error(403, "Invalid dashboard UUID.")

		const promises = await Promise.all([getRoles(), superValidate(request, zod(countryCodeSchema))])
		const roles = promises[0]
		const form = promises[1]

		if (user.id !== slug && !roles?.administrator)
			return setError(form, "", "You cannot access another scripter dashboard.")

		const scripter = await getScripter(supabaseServer, slug)
		if (scripter.stripe) return setError(form, "", "Stripe account is already created!")
		if (!form.valid) return setError(form, "", "The country code form is not valid!")

		const link = await createStripeConnectAccount(
			supabaseServer,
			origin,
			scripter,
			user.email,
			form.data.code
		)
		if (link) redirect(303, link)
		return { form }
	},
	updateStripe: async ({
		locals: { supabaseServer, user, getRoles },
		url: { origin },
		params: { slug }
	}) => {
		if (!user)
			return await doLogin(supabaseServer, origin, new URLSearchParams("login&provider=discord"))

		if (!UUID_V4_REGEX.test(slug)) error(403, "Invalid dashboard UUID.")

		const roles = await getRoles()
		if (user.id !== slug && !roles?.administrator)
			error(403, "You cannot access another scripter dashboard.")

		const scripter = await getScripter(supabaseServer, slug)
		if (!scripter.stripe) error(403, "You need a linked stripe account to edit it.")

		const link = await finishStripeConnectAccountSetup(origin, scripter.stripe)
		if (link) redirect(303, link)
		return
	},

	displayName: async ({
		request,
		locals: { supabaseServer, user, getRoles },
		url: { origin },
		params: { slug }
	}) => {
		if (!user)
			return await doLogin(supabaseServer, origin, new URLSearchParams("login&provider=discord"))

		if (!UUID_V4_REGEX.test(slug)) error(403, "Invalid dashboard UUID.")

		const promises = await Promise.all([getRoles(), superValidate(request, zod(dbaSchema))])
		const roles = promises[0]
		const form = promises[1]

		if (user.id !== slug && !roles?.administrator)
			error(403, "You cannot access another scripter dashboard.")

		const scripter = await getScripter(supabaseServer, slug)
		if (!scripter.stripe) return setError(form, "", "The user is missing a stripe profile!")
		if (!form.valid) return setError(form, "", "The name you set is not valid!")

		const success = await updateStripeConnectAccount(scripter.stripe, form.data.dba)
		if (!success) return setError(form, "", "Failed to update stripe's business name")
		return { form }
	},

	bundleEdit: async ({
		request,
		locals: { supabaseServer, user, getRoles },
		url: { origin, searchParams },
		params: { slug }
	}) => {
		if (!user)
			return await doLogin(supabaseServer, origin, new URLSearchParams("login&provider=discord"))

		if (!UUID_V4_REGEX.test(slug)) error(403, "Invalid dashboard UUID.")

		const promises = await Promise.all([getRoles(), superValidate(request, zod(bundleArraySchema))])
		const roles = promises[0]
		const form = promises[1]

		if (user.id !== slug && !roles?.administrator)
			error(403, "You cannot access another scripter dashboard.")

		if (!form.valid) return setError(form, "", "The form is not valid!")

		const scripter = await getScripter(supabaseServer, slug)

		if (!scripter.stripe) return setError(form, "", "Stripe account is not setup!")

		const productID = searchParams.get("product")

		if (!productID) {
			return setError(
				form,
				"",
				"Something went wrong! Seems like no product was selected. If this keeps occuring please contact support@waspscripts.com"
			)
		}

		const product = form.data.bundles.find((bundle) => bundle.id === productID)

		if (!product) {
			return setError(
				form,
				"",
				"Something went wrong! Seems like the selected bundle product is invalid. If this keeps occuring please contact support@waspscripts.com"
			)
		}

		if (product.bundledScripts.length < 2)
			return setError(form, "", "You need to add at least 2 scripts to a bundle.")

		const { data: productsData, error: errProducts } = await supabaseServer
			.schema("scripts")
			.from("products")
			.select("name, bundle")
			.eq("id", product.id)
			.single()

		if (errProducts) return setError(form, "", formatError(errProducts))

		if (!productsData.bundle) return setError(form, "", "That product is missing a bundle ID!")

		if (product.name !== productsData.name) await updateStripeProduct(product.id, product.name)

		const { data: pricesData, error: errPrices } = await supabaseServer
			.schema("scripts")
			.from("prices")
			.select("id, amount")
			.eq("product", product.id)
			.eq("active", true)

		if (errPrices) return setError(form, "", formatError(errPrices))

		for (let i = 0; i < pricesData.length; i++) {
			const currentPrice = pricesData[i]
			const newPrice = product.prices.find((price) => price.id === currentPrice.id)

			if (!newPrice) continue

			const promises = []
			if (Math.round(newPrice.amount * 100) !== currentPrice.amount)
				promises.push(
					updateStripePrice({
						active: true,
						amount: newPrice.amount,
						currency: newPrice.currency,
						id: newPrice.id,
						interval: newPrice.interval,
						product: product.id
					})
				)

			if (promises.length > 0) await Promise.all(promises)
		}

		const scripts = product.bundledScripts.reduce((acc: string[], script) => {
			if (script.active) acc.push(script.id)
			return acc
		}, [])

		const { error: err } = await supabaseServer
			.schema("scripts")
			.from("bundles")
			.update({ scripts: scripts })
			.eq("id", productsData.bundle)

		if (err) return setError(form, "", err.message)

		return { form }
	},
	bundleAdd: async ({
		request,
		locals: { supabaseServer, user, getRoles },
		url: { origin },
		params: { slug }
	}) => {
		if (!user)
			return await doLogin(supabaseServer, origin, new URLSearchParams("login&provider=discord"))

		if (!UUID_V4_REGEX.test(slug)) error(403, "Invalid dashboard UUID.")

		const promises = await Promise.all([getRoles(), superValidate(request, zod(newBundleSchema))])
		const roles = promises[0]
		const form = promises[1]

		if (user.id !== slug && !roles?.administrator)
			error(403, "You cannot access another scripter dashboard.")

		if (!form.valid) return setError(form, "", "The form is not valid!")

		const scripter = await getScripter(supabaseServer, slug)

		if (!scripter.stripe) return setError(form, "", "Stripe account is not setup!")

		if (!roles?.moderator || !roles?.administrator) form.data.user_id = user.id

		const err = await createStripeBundleProduct(supabaseServer, form.data)

		if (err) return setError(form, "", err.message)

		return { form }
	},

	scriptEdit: async ({
		request,
		locals: { supabaseServer, user, getRoles },
		url: { origin, searchParams },
		params: { slug }
	}) => {
		if (!user) {
			return await doLogin(supabaseServer, origin, new URLSearchParams("login&provider=discord"))
		}

		if (!UUID_V4_REGEX.test(slug)) error(403, "Invalid dashboard UUID.")

		const promises = await Promise.all([getRoles(), superValidate(request, zod(scriptArraySchema))])
		const roles = promises[0]
		const form = promises[1]

		if (user.id !== slug && !roles?.administrator) {
			error(403, "You cannot access another scripter dashboard.")
		}

		if (!form.valid) return setError(form, "", "The form is not valid!")

		const scripter = await getScripter(supabaseServer, slug)

		if (!scripter.stripe) return setError(form, "", "Stripe account is not setup!")

		const productID = searchParams.get("product")
		if (!productID) {
			return setError(
				form,
				"",
				"Something went wrong! Seems like no product was selected. If this keeps occuring please contact support@waspscripts.com"
			)
		}

		const product = form.data.scripts.find((script) => script.id === productID)

		if (!product) {
			return setError(
				form,
				"",
				"Something went wrong! Seems like the selected script product is invalid. If this keeps occuring please contact support@waspscripts.com"
			)
		}

		const { data: productsData, error: errProducts } = await supabaseServer
			.schema("scripts")
			.from("products")
			.select("name")
			.eq("id", product.id)
			.single()

		if (errProducts) return setError(form, "", errProducts.message)

		if (product.name !== productsData.name) await updateStripeProduct(product.id, product.name)

		const { data: pricesData, error: errPrices } = await supabaseServer
			.schema("scripts")
			.from("prices")
			.select("id, amount, interval")
			.eq("product", product.id)
			.eq("active", true)

		if (errPrices) return setError(form, "", errPrices.message)

		for (let i = 0; i < pricesData.length; i++) {
			const currentPrice = pricesData[i]
			const j = product.prices.findIndex((price) => price.id === currentPrice.id)
			if (j === -1) continue
			const newPrice = product.prices[j]

			const updatePricesPromises = []
			if (Math.round(newPrice.amount * 100) !== currentPrice.amount)
				updatePricesPromises.push(
					updateStripePrice({
						active: true,
						amount: newPrice.amount,
						currency: newPrice.currency,
						id: newPrice.id,
						interval: newPrice.interval,
						product: product.id
					})
				)

			await Promise.all(updatePricesPromises)
			product.prices.splice(j, 1)
		}

		const createPricePromises = []
		for (let i = 0; i < product.prices.length; i++) {
			const currentPrice = product.prices[i]
			const j = pricesData.findIndex((price) => price.interval === currentPrice.interval)
			if (j > -1) {
				pricesData.splice(j, 1)
				continue
			}
			createPricePromises.push(createStripePrice(currentPrice, product.id))
		}

		await Promise.all(createPricePromises)

		return { form }
	},
	scriptAdd: async ({
		request,
		locals: { supabaseServer, user, getRoles },
		url: { origin, searchParams },
		params: { slug }
	}) => {
		if (!user) {
			return await doLogin(supabaseServer, origin, new URLSearchParams("login&provider=discord"))
		}
		if (!UUID_V4_REGEX.test(slug)) error(403, "Invalid dashboard UUID.")

		const promises = await Promise.all([
			getRoles(),
			superValidate(request, zod(newScriptArraySchema))
		])

		const roles = promises[0]
		const form = promises[1]

		if (user.id !== slug && !roles?.administrator) {
			error(403, "You cannot access another scripter dashboard.")
		}

		if (!form.valid) return setError(form, "", "The form is not valid!")

		const scripter = await getScripter(supabaseServer, slug)

		if (!scripter.stripe) return setError(form, "", "Stripe account is not setup!")

		const productID = searchParams.get("script")
		if (!productID) {
			return setError(
				form,
				"",
				"Something went wrong! Seems like no product was selected. If this keeps occuring please contact support@waspscripts.com"
			)
		}

		const script = form.data.newScripts.find((script) => script.id === productID)

		if (!script) {
			return setError(
				form,
				"",
				"Something went wrong! Seems like the selected script is invalid. If this keeps occuring please contact support@waspscripts.com"
			)
		}

		const { data: protectedData, error: errProtected } = await supabaseServer
			.schema("scripts")
			.from("protected")
			.select("author_id")
			.eq("id", script.id)
			.single()

		if (errProtected) return setError(form, "", formatError(errProtected))

		await createStripeScriptProduct(script, protectedData.author_id)

		return { form }
	},

	addFreeAccess: async ({
		request,
		locals: { supabaseServer, user, getRoles },
		url: { origin, searchParams },
		params: { slug }
	}) => {
		if (!user)
			return await doLogin(supabaseServer, origin, new URLSearchParams("login&provider=discord"))

		if (!UUID_V4_REGEX.test(slug)) error(403, "Invalid dashboard UUID.")

		const promises = await Promise.all([getRoles(), request.formData()])
		const roles = promises[0]

		if (user.id !== slug && !roles?.administrator)
			error(403, "You cannot access another scripter dashboard.")

		const product = searchParams.get("product")
		if (!product) error(403, "Product not specified.")

		const data = promises[1]

		const id = data.get(product + "_new_free_access_user_id")?.toString()
		if (!id || id === "") error(403, "User ID not specified.")
		if (!UUID_V4_REGEX.test(id)) error(403, "User ID is not a valid UUID.")

		const date_end_str = data.get(product + "_new_free_access_end_date")?.toString()
		if (!date_end_str || date_end_str === "") error(403, "End date not specified.")

		const date_end = new Date(date_end_str).toISOString().toLocaleString()

		const err = await addFreeAccess(supabaseServer, id, product, date_end)

		if (err) error(403, formatError(err))

		return
	},
	cancelFreeAccess: async ({
		request,
		locals: { supabaseServer, user, getRoles },
		url: { origin, searchParams },
		params: { slug }
	}) => {
		if (!user)
			return await doLogin(supabaseServer, origin, new URLSearchParams("login&provider=discord"))

		if (!UUID_V4_REGEX.test(slug)) error(403, "Invalid dashboard UUID.")

		const promises = await Promise.all([getRoles(), request.formData()])
		const roles = promises[0]

		if (user.id !== slug && !roles?.administrator)
			error(403, "You cannot access another scripter dashboard.")

		const product = searchParams.get("product")
		if (!product) error(403, "Product not specified.")

		const id = searchParams.get("id")
		if (!id) error(403, "User ID not specified.")
		if (!UUID_V4_REGEX.test(id)) error(403, "User ID is not a valid UUID.")

		const err = await cancelFreeAccess(supabaseServer, id, product)
		if (err) error(403, formatError(err))

		return
	},

	cancelSub: async ({
		locals: { supabaseServer, user, getRoles },
		url: { origin, searchParams },
		params: { slug }
	}) => {
		if (!user)
			return await doLogin(supabaseServer, origin, new URLSearchParams("login&provider=discord"))

		if (!UUID_V4_REGEX.test(slug)) error(403, "Invalid dashboard UUID.")

		const roles = await getRoles()
		if (user.id !== slug && !roles?.administrator)
			error(403, "You cannot access another scripter dashboard.")

		const subscription = searchParams.get("subscription")
		if (!subscription) error(403, "Subscription not specified.")

		let success = true

		try {
			await stripe.subscriptions.update(subscription, { cancel_at_period_end: true })
		} catch (err) {
			console.error(err)
			success = false
		}

		if (!success) error(503, "Failed to update subscription on stripe side.")

		const { error: err } = await supabaseServer
			.schema("profiles")
			.from("subscription")
			.update({ disabled: true })
			.eq("subscription", subscription)

		if (err)
			fail(503, {
				message:
					"Please contact Torwent and give him this message, Error: " +
					formatError(err) +
					" sub: " +
					subscription
			})

		return { success: true }
	},
	cancelAllSubs: async ({
		locals: { supabaseServer, user, getRoles },
		url: { origin, searchParams },
		params: { slug }
	}) => {
		if (!user)
			return await doLogin(supabaseServer, origin, new URLSearchParams("login&provider=discord"))

		if (!UUID_V4_REGEX.test(slug)) error(403, "Invalid dashboard UUID.")

		const roles = await getRoles()

		if (user.id !== slug && !roles?.administrator)
			error(403, "You cannot access another scripter dashboard.")

		const product = searchParams.get("product")
		if (!product) error(403, "Product not specified.")

		const { data, error: err } = await supabaseServer
			.schema("profiles")
			.from("subscription")
			.update({ disabled: true })
			.eq("product", product)
			.select("subscription")

		if (err) {
			error(
				503,
				"Please contact Torwent and give him this message\n" +
					"Product: " +
					product +
					"\n\n" +
					formatError(err)
			)
		}

		data.forEach(async (sub) => {
			let success = true

			try {
				await stripe.subscriptions.update(sub.subscription, { cancel_at_period_end: true })
			} catch (error) {
				success = false
			}

			if (!success)
				error(503, "Failed to update subscription: " + sub.subscription + " on stripe side.")
		})

		return { success: true }
	}
}
