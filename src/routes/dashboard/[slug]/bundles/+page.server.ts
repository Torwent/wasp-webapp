import { bundleArraySchema, newBundleSchema } from "$lib/client/schemas"
import { getScripter } from "$lib/client/supabase"
import {
	createStripeBundleProduct,
	stripe,
	updateStripePrice,
	updateStripeProduct
} from "$lib/server/stripe.server"
import { addFreeAccess, cancelFreeAccess, doLogin } from "$lib/server/supabase.server"
import { formatError, UUID_V4_REGEX } from "$lib/utils"
import { error } from "@sveltejs/kit"
import { fail, setError, superValidate } from "sveltekit-superforms"
import { zod } from "sveltekit-superforms/adapters"

export const load = async ({ locals: { supabaseServer }, params: { slug }, parent }) => {
	const { scripts, scripter, products, prices, data } = await parent()
	if (!scripter.stripe)
		error(
			403,
			"To use this section of the dashboard you need to go through and finish the stripe on-boarding."
		)

	const newPrices = [
		{ amount: 4, currency: "eur", interval: "week" },
		{ amount: 7.5, currency: "eur", interval: "month" },
		{ amount: 50, currency: "eur", interval: "year" }
	]

	const bundleProducts = products.filter((p) => p.bundle)
	const subs: (typeof data.data)[] = []
	const free: (typeof data.freeData)[] = []

	async function getBundles() {
		const { data: bundleData, error: err } = await supabaseServer
			.schema("scripts")
			.from("bundles")
			.select(`id, name, scripts, quantity, user_id, username, product`)
			.order("name", { ascending: true })
			.eq("user_id", slug)

		if (err) {
			error(
				500,
				"Server error, this is probably not an issue on your end!\n" +
					"SELECT scripts.bundles failed!\n\n" +
					formatError(err)
			)
		}

		return await Promise.all(
			bundleData.map(async (bundle) => {
				const product = bundleProducts.find((p) => p.id == bundle.product)!
				subs.push(data.data.filter((s) => s.product === product.id))
				free.push(data.freeData.filter((f) => f.product === product.id))

				const productPrices = prices.filter((price) => price.product == product.id)
				if (productPrices.length < 3) {
					const intervals = ["week", "month", "year"]
					intervals.forEach((interval) => {
						const i = productPrices.findIndex((price) => price.interval === interval)
						if (i === -1) {
							productPrices.push({
								active: true,
								amount: 0,
								currency: "eur",
								id: "price_noID",
								interval: interval,
								product: product.id
							})
						}
					})

					productPrices.sort((priceA, priceB) => {
						return (
							intervals.findIndex((p) => p === priceA.interval) -
							intervals.findIndex((p) => p === priceB.interval)
						)
					})
				}

				return {
					id: product.id,
					name: bundle.name,
					user_id: bundle.user_id,
					prices: productPrices,
					bundledScripts: scripts.map((script) => ({
						...script,
						active: bundle.scripts.includes(script.id)
					})),
					open: false,
					subsOpen: false,
					freeOpen: false
				}
			})
		)
	}

	const bundles = await getBundles()

	const promises = await Promise.all([
		superValidate({ bundles }, zod(bundleArraySchema)),
		superValidate(
			{ user_id: slug, prices: newPrices, bundledScripts: scripts },
			zod(newBundleSchema),
			{ errors: false }
		)
	])

	return {
		bundlesForm: promises[0],
		newBundleForm: promises[1],
		subscriptions: subs,
		freeAccess: free
	}
}

export const actions = {
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

	addFree: async ({
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

		const id = data.get("userid")?.toString()
		if (!id || id === "") error(403, "User ID not specified.")
		if (!UUID_V4_REGEX.test(id)) error(403, "User ID is not a valid UUID.")

		const date_end_str = data.get("enddate")?.toString()
		if (!date_end_str || date_end_str === "") error(403, "End date not specified.")

		const date_end = new Date(date_end_str).toISOString().toLocaleString()

		const err = await addFreeAccess(supabaseServer, id, product, date_end)

		if (err) error(403, formatError(err))

		return
	},
	cancelFree: async ({
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
			} catch {
				success = false
			}

			if (!success)
				error(503, "Failed to update subscription: " + sub.subscription + " on stripe side.")
		})

		return { success: true }
	}
}
