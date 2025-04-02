import { newScriptSchema, scriptArraySchema } from "$lib/client/schemas"
import { getScripter } from "$lib/client/supabase"
import {
	createStripePrice,
	createStripeScriptProduct,
	stripe,
	updateStripePrice,
	updateStripeProduct
} from "$lib/server/stripe.server"
import { addFreeAccess, cancelFreeAccess, doLogin } from "$lib/server/supabase.server"
import { formatError, UUID_V4_REGEX } from "$lib/utils"
import { error, redirect } from "@sveltejs/kit"
import { fail, setError, superValidate } from "sveltekit-superforms"
import { zod } from "sveltekit-superforms/adapters"

export const load = async ({ params: { slug }, parent }) => {
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

	const scriptProducts = products.filter((p) => p.script)
	const subs: (typeof data.data)[] = []
	const free: (typeof data.freeData)[] = []

	let available = scripts
	const scriptData = scriptProducts.map((product) => {
		available = available.filter((script) => script.id !== product.script)
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
			script: product.script!,
			user_id: slug,
			name: product.name,
			prices: productPrices,
			subsOpen: false,
			freeOpen: false
		}
	})

	const promises = await Promise.all([
		superValidate({ scripts: scriptData }, zod(scriptArraySchema)),
		superValidate(
			{ id: available.length > 0 ? available[0].id : "", user_id: slug, prices: newPrices },
			zod(newScriptSchema),
			{ errors: false }
		)
	])

	return {
		scriptsForm: promises[0],
		newScriptForm: promises[1],
		available,
		subscriptions: subs,
		freeAccess: free
	}
}

export const actions = {
	scriptEdit: async ({
		request,
		locals: { supabaseServer, user, getRoles },
		url: { origin, searchParams, pathname },
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
		redirect(303, pathname)
	},
	scriptAdd: async ({
		request,
		locals: { supabaseServer, user, getRoles },
		url: { origin, pathname },
		params: { slug }
	}) => {
		if (!user) {
			return await doLogin(supabaseServer, origin, new URLSearchParams("login&provider=discord"))
		}
		if (!UUID_V4_REGEX.test(slug)) error(403, "Invalid dashboard UUID.")

		const promises = await Promise.all([getRoles(), superValidate(request, zod(newScriptSchema))])

		const roles = promises[0]
		const form = promises[1]

		if (user.id !== slug && !roles?.administrator) {
			error(403, "You cannot access another scripter dashboard.")
		}

		if (!form.valid) return setError(form, "", "The form is not valid!")

		const scripter = await getScripter(supabaseServer, slug)

		if (!scripter.stripe) return setError(form, "", "Stripe account is not setup!")

		const { data: prodData, error: err } = await supabaseServer
			.schema("scripts")
			.from("products")
			.select(`id`)
			.eq("user_id", form.data.user_id)
			.eq("script", form.data.id)
			.maybeSingle()

		if (err) {
			error(
				500,
				"Server error, this is probably not an issue on your end!\n" +
					"SELECT product failed!\n\n" +
					formatError(err)
			)
		}

		if (prodData) return setError(form, "", "You already have a product for that script!")

		const { data, error: errProtected } = await supabaseServer
			.schema("scripts")
			.from("protected")
			.select("author_id, scripts!inner (title)")
			.eq("id", form.data.id)
			.single()

		if (errProtected) return setError(form, "", formatError(errProtected))

		await createStripeScriptProduct(form.data, data.scripts.title, data.author_id)

		redirect(303, pathname)
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
