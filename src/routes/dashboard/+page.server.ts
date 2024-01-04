import { getScripterDashboard } from "$lib/backend/data"
import {
	createStripeConnectAccount,
	createStripeBundleProduct,
	createStripePrice,
	createStripeScriptProduct,
	doLogin,
	finishStripeAccountSetup,
	updateStripePrice,
	updateStripeProduct,
	getStripeSession
} from "$lib/backend/data.server"
import {
	bundleArraySchema,
	countryCodeSchema,
	newBundleSchema,
	newScriptArraySchema,
	scriptArraySchema
} from "$lib/backend/schemas"
import { error, redirect } from "@sveltejs/kit"
import { setError, superValidate } from "sveltekit-superforms/server"

export const load = async (event) => {
	const { supabaseServer, getProfile } = event.locals
	const profile = await getProfile()
	if (!profile) throw error(403, "You need to be logged in.")

	const promises = await Promise.all([
		superValidate(event, countryCodeSchema),
		superValidate(event, bundleArraySchema),
		superValidate(event, newBundleSchema),
		superValidate(event, scriptArraySchema),
		superValidate(event, newScriptArraySchema),
		getScripterDashboard(supabaseServer, profile.id)
	])

	event.depends("dashboard:stripe_session")
	const stripeSession = promises[5].stripe ? await getStripeSession(promises[5].stripe) : null

	return {
		countryForm: promises[0],
		bundlesForm: promises[1],
		newBundleForm: promises[2],
		scriptsForm: promises[3],
		newScriptForm: promises[4],
		stripeSession: stripeSession
	}
}

export const actions = {
	createStripe: async ({
		request,
		locals: { supabaseServer, getSession, getProfile },
		url: { origin }
	}) => {
		const promises = await Promise.all([getSession(), getProfile(), request.formData()])
		const profile = promises[1]

		if (!promises[0] || !profile) {
			return await doLogin(supabaseServer, origin, new URLSearchParams("login&provider=discord"))
		}

		const scripter = await getScripterDashboard(supabaseServer, profile.id)

		const form = await superValidate(promises[2], countryCodeSchema)
		if (!form.valid) return setError(form, "", "The country code form is not valid!")
		if (scripter.stripe) return setError(form, "", "Stripe account is already created!")

		const link = await createStripeConnectAccount(supabaseServer, origin, scripter, form.data.code)
		if (link) throw redirect(303, link)
		return
	},

	updateStripe: async ({ locals: { supabaseServer, getSession, getProfile }, url: { origin } }) => {
		const promises = await Promise.all([getSession(), getProfile()])
		const profile = promises[1]

		if (!promises[0] || !profile) {
			return await doLogin(supabaseServer, origin, new URLSearchParams("login&provider=discord"))
		}

		const scripter = await getScripterDashboard(supabaseServer, profile.id)
		if (!scripter.stripe) throw error(403, "You need a linked stripe account to edit it.")

		const link = await finishStripeAccountSetup(origin, scripter.stripe)

		if (link) throw redirect(303, link)
		return
	},

	bundleEdit: async ({
		request,
		locals: { supabaseServer, getSession, getProfile },
		url: { origin, searchParams }
	}) => {
		const promises = await Promise.all([getSession(), getProfile(), request.formData()])
		const profile = promises[1]

		if (!promises[0] || !profile) {
			return await doLogin(supabaseServer, origin, new URLSearchParams("login&provider=discord"))
		}

		const form = await superValidate(promises[2], bundleArraySchema)
		if (!form.valid) return setError(form, "", "The form is not valid!")

		const scripter = await getScripterDashboard(supabaseServer, profile.id)

		if (!scripter.stripe) {
			console.error("Stripe account is not setup!")
			return setError(form, "", "Stripe account is not setup!")
		}

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

		if (product.bundledScripts.length < 2) {
			return setError(form, "", "You need to add at least 2 scripts to a bundle.")
		}

		const { data: productsData, error: errProducts } = await supabaseServer
			.schema("scripts")
			.from("products")
			.select("name, bundle")
			.eq("id", product.id)
			.maybeSingle()

		if (errProducts) {
			console.error(errProducts)
			return setError(form, "", errProducts.message)
		}

		if (!productsData) {
			return setError(form, "", "that product doesn't seem to exist!")
		}

		if (!productsData.bundle) {
			return setError(form, "", "That product is missing a bundle ID!")
		}

		if (product.name !== productsData.name) {
			await updateStripeProduct(product.id, product.name)
		}

		const { data: pricesData, error: errPrices } = await supabaseServer
			.schema("scripts")
			.from("prices")
			.select("id, amount")
			.eq("product", product.id)
			.eq("active", true)

		if (errPrices) {
			console.error(errPrices)
			return setError(form, "", errPrices.message)
		}

		for (let i = 0; i < pricesData.length; i++) {
			const currentPrice = pricesData[i]
			const newPrice = product.prices.find((price) => price.id === currentPrice.id)

			if (!newPrice) continue
			if (newPrice.amount * 100 !== currentPrice.amount)
				await updateStripePrice({
					active: true,
					amount: newPrice.amount,
					currency: newPrice.currency,
					id: newPrice.id,
					interval: newPrice.interval,
					product: product.id
				})
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

		if (err) {
			console.error(err)
			return setError(form, "", err.message)
		}

		return
	},
	bundleAdd: async ({
		request,
		locals: { supabaseServer, getSession, getProfile },
		url: { origin }
	}) => {
		console.log("bundleAdd")
		const promises = await Promise.all([getSession(), getProfile(), request.formData()])
		const profile = promises[1]

		if (!promises[0] || !profile) {
			return await doLogin(supabaseServer, origin, new URLSearchParams("login&provider=discord"))
		}

		const form = await superValidate(promises[2], newBundleSchema)
		if (!form.valid) return setError(form, "", "The form is not valid!")

		const scripter = await getScripterDashboard(supabaseServer, profile.id)

		if (!scripter.stripe) {
			console.error("Stripe account is not setup!")
			return setError(form, "", "Stripe account is not setup!")
		}

		if (!profile.roles.moderator || !profile.roles.administrator) {
			form.data.user_id = profile.id
		}

		const err = await createStripeBundleProduct(supabaseServer, form.data)

		if (err) {
			console.error(err)
			return setError(form, "", err.message)
		}

		return
	},

	scriptEdit: async ({
		request,
		locals: { supabaseServer, getSession, getProfile },
		url: { origin, searchParams }
	}) => {
		const promises = await Promise.all([getSession(), getProfile(), request.formData()])
		const profile = promises[1]

		if (!promises[0] || !profile) {
			return await doLogin(supabaseServer, origin, new URLSearchParams("login&provider=discord"))
		}

		const form = await superValidate(promises[2], scriptArraySchema)
		if (!form.valid) return setError(form, "", "The form is not valid!")

		const scripter = await getScripterDashboard(supabaseServer, profile.id)

		if (!scripter.stripe) {
			console.error("Stripe account is not setup!")
			return setError(form, "", "Stripe account is not setup!")
		}

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
			.maybeSingle()

		if (errProducts) {
			console.error(errProducts)
			return setError(form, "", errProducts.message)
		}

		if (!productsData) {
			console.error(errProducts)
			return setError(form, "", "that product doesn't seem to exist!")
		}

		if (product.name !== productsData.name) {
			await updateStripeProduct(product.id, product.name)
		}

		const { data: pricesData, error: errPrices } = await supabaseServer
			.schema("scripts")
			.from("prices")
			.select("id, amount, interval")
			.eq("product", product.id)
			.eq("active", true)

		if (errPrices) {
			console.error(errPrices)
			return setError(form, "", errPrices.message)
		}

		for (let i = 0; i < pricesData.length; i++) {
			const currentPrice = pricesData[i]
			const j = product.prices.findIndex((price) => price.id === currentPrice.id)
			if (j === -1) continue
			const newPrice = product.prices[j]

			if (newPrice.amount * 100 !== currentPrice.amount)
				await updateStripePrice({
					active: true,
					amount: newPrice.amount,
					currency: newPrice.currency,
					id: newPrice.id,
					interval: newPrice.interval,
					product: product.id
				})

			product.prices.splice(j, 1)
		}

		for (let i = 0; i < product.prices.length; i++) {
			const currentPrice = product.prices[i]
			const j = pricesData.findIndex((price) => price.interval === currentPrice.interval)
			if (j > -1) {
				pricesData.splice(j, 1)
				continue
			}
			await createStripePrice(currentPrice, product.id)
		}

		return
	},

	scriptAdd: async ({
		request,
		locals: { supabaseServer, getSession, getProfile },
		url: { origin, searchParams }
	}) => {
		const promises = await Promise.all([getSession(), getProfile(), request.formData()])
		const profile = promises[1]

		if (!promises[0] || !profile) {
			return await doLogin(supabaseServer, origin, new URLSearchParams("login&provider=discord"))
		}

		const form = await superValidate(promises[2], newScriptArraySchema)
		if (!form.valid) return setError(form, "", "The form is not valid!")

		const scripter = await getScripterDashboard(supabaseServer, profile.id)

		if (!scripter.stripe) {
			console.error("Stripe account is not setup!")
			return setError(form, "", "Stripe account is not setup!")
		}

		const productID = searchParams.get("script")
		if (!productID) {
			return setError(
				form,
				"",
				"Something went wrong! Seems like no product was selected. If this keeps occuring please contact support@waspscripts.com"
			)
		}

		const script = form.data.scripts.find((script) => script.id === productID)

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

		if (errProtected) {
			console.error(errProtected)
			return setError(form, "", errProtected.message)
		}

		if (!protectedData) {
			return setError(
				form,
				"",
				"Something went wrong! Couldn't get the author id for that script. If this keeps occuring please contact support@waspscripts.com error: "
			)
		}

		await createStripeScriptProduct(script, protectedData.author_id)

		return { form }
	}
}
