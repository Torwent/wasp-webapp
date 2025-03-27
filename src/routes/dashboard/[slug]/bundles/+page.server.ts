import {
	bundleArraySchema,
	newBundleSchema,
	newScriptArraySchema,
	scriptArraySchema
} from "$lib/client/schemas"
import { getScripter } from "$lib/client/supabase"
import {
	createStripeBundleProduct,
	createStripePrice,
	createStripeScriptProduct,
	stripe,
	updateStripePrice,
	updateStripeProduct
} from "$lib/server/stripe.server"
import { addFreeAccess, cancelFreeAccess, doLogin } from "$lib/server/supabase.server"
import { formatError, UUID_V4_REGEX } from "$lib/utils"
import { error } from "@sveltejs/kit"
import { fail, setError, superValidate } from "sveltekit-superforms"
import { zod } from "sveltekit-superforms/adapters"

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
			} catch (error) {
				success = false
			}

			if (!success)
				error(503, "Failed to update subscription: " + sub.subscription + " on stripe side.")
		})

		return { success: true }
	}
}
