import { getScripterDashboard } from "$lib/backend/data"
import {
	createStripeConnectAccount,
	createStripeBundleProduct,
	createStripePrice,
	createStripeScriptProduct,
	doLogin,
	finishStripeConnectAccountSetup,
	updateStripePrice,
	updateStripeProduct,
	getStripeSession,
	getStripeConnectAccount,
	updateStripeConnectAccount,
	addFreeAccess,
	cancelFreeAccess
} from "$lib/backend/data.server"
import {
	bundleArraySchema,
	nullSchema,
	countryCodeSchema,
	dbaSchema,
	newBundleSchema,
	newScriptArraySchema,
	scriptArraySchema
} from "$lib/backend/schemas"
import { UUID_V4_REGEX } from "$lib/utils"
import { error, redirect } from "@sveltejs/kit"
import { setError, superValidate } from "sveltekit-superforms/server"

export const load = async (event) => {
	const { supabaseServer, getProfile } = event.locals
	const profile = await getProfile()
	if (!profile) throw error(403, "You need to be logged in.")
	const {
		params: { slug }
	} = event

	if (!UUID_V4_REGEX.test(slug)) throw error(403, "Invalid dashboard UUID.")
	if (profile.id !== slug && !profile.roles.administrator)
		throw error(403, "You cannot access another scripter dashboard.")

	const promises = await Promise.all([
		superValidate(event, countryCodeSchema),
		superValidate(event, dbaSchema),
		superValidate(event, bundleArraySchema),
		superValidate(event, newBundleSchema),
		superValidate(event, scriptArraySchema),
		superValidate(event, newScriptArraySchema),
		getScripterDashboard(supabaseServer, slug)
	])

	event.depends("dashboard:stripe_session")

	const scripter = promises[6]

	const stripeAccount = scripter.stripe ? await getStripeConnectAccount(scripter.stripe) : null
	const stripeSession = scripter.stripe ? await getStripeSession(scripter.stripe) : null

	return {
		countryForm: promises[0],
		dbaForm: promises[1],
		bundlesForm: promises[2],
		newBundleForm: promises[3],
		scriptsForm: promises[4],
		newScriptForm: promises[5],
		stripeAccount,
		stripeSession
	}
}

export const actions = {
	createStripe: async ({
		request,
		locals: { supabaseServer, getSession, getProfile },
		url: { origin },
		params: { slug }
	}) => {
		const promises = await Promise.all([getSession(), getProfile(), request.formData()])
		const profile = promises[1]

		if (!promises[0] || !profile) {
			return await doLogin(supabaseServer, origin, new URLSearchParams("login&provider=discord"))
		}

		if (!UUID_V4_REGEX.test(slug)) throw error(403, "Invalid dashboard UUID.")
		if (profile.id !== slug && !profile.roles.administrator)
			throw error(403, "You cannot access another scripter dashboard.")

		const scripter = await getScripterDashboard(supabaseServer, slug)

		const form = await superValidate(promises[2], countryCodeSchema)
		if (!form.valid) return setError(form, "", "The country code form is not valid!")
		if (scripter.stripe) return setError(form, "", "Stripe account is already created!")

		const link = await createStripeConnectAccount(supabaseServer, origin, scripter, form.data.code)
		if (link) throw redirect(303, link)
		return
	},
	updateStripe: async ({
		locals: { supabaseServer, getSession, getProfile },
		url: { origin },
		params: { slug }
	}) => {
		const promises = await Promise.all([getSession(), getProfile()])
		const profile = promises[1]

		if (!promises[0] || !profile) {
			return await doLogin(supabaseServer, origin, new URLSearchParams("login&provider=discord"))
		}

		if (!UUID_V4_REGEX.test(slug)) throw error(403, "Invalid dashboard UUID.")
		if (profile.id !== slug && !profile.roles.administrator)
			throw error(403, "You cannot access another scripter dashboard.")

		const scripter = await getScripterDashboard(supabaseServer, slug)
		if (!scripter.stripe) throw error(403, "You need a linked stripe account to edit it.")

		const link = await finishStripeConnectAccountSetup(origin, scripter.stripe)

		if (link) throw redirect(303, link)
		return
	},

	displayName: async ({
		request,
		locals: { supabaseServer, getSession, getProfile },
		url: { origin },
		params: { slug }
	}) => {
		const promises = await Promise.all([getSession(), getProfile(), request.formData()])
		const profile = promises[1]

		if (!promises[0] || !profile) {
			return await doLogin(supabaseServer, origin, new URLSearchParams("login&provider=discord"))
		}

		if (!UUID_V4_REGEX.test(slug)) throw error(403, "Invalid dashboard UUID.")
		if (profile.id !== slug && !profile.roles.administrator)
			throw error(403, "You cannot access another scripter dashboard.")

		const scripter = await getScripterDashboard(supabaseServer, slug)

		const form = await superValidate(promises[2], dbaSchema)
		if (!form.valid) return setError(form, "", "The name you set is not valid!")
		if (!scripter.stripe) return setError(form, "", "The user is missing a stripe profile!")

		const success = await updateStripeConnectAccount(scripter.stripe, form.data.dba)
		if (!success) return setError(form, "", "Failed to update stripe's business name")
		return
	},

	bundleEdit: async ({
		request,
		locals: { supabaseServer, getSession, getProfile },
		url: { origin, searchParams },
		params: { slug }
	}) => {
		const promises = await Promise.all([getSession(), getProfile(), request.formData()])
		const profile = promises[1]

		if (!promises[0] || !profile) {
			return await doLogin(supabaseServer, origin, new URLSearchParams("login&provider=discord"))
		}

		if (!UUID_V4_REGEX.test(slug)) throw error(403, "Invalid dashboard UUID.")
		if (profile.id !== slug && !profile.roles.administrator)
			throw error(403, "You cannot access another scripter dashboard.")

		const form = await superValidate(promises[2], bundleArraySchema)
		if (!form.valid) return setError(form, "", "The form is not valid!")

		const scripter = await getScripterDashboard(supabaseServer, slug)

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
			if (Math.round(newPrice.amount * 100) !== currentPrice.amount)
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
		url: { origin },
		params: { slug }
	}) => {
		console.log("bundleAdd")
		const promises = await Promise.all([getSession(), getProfile(), request.formData()])
		const profile = promises[1]

		if (!promises[0] || !profile) {
			return await doLogin(supabaseServer, origin, new URLSearchParams("login&provider=discord"))
		}

		if (!UUID_V4_REGEX.test(slug)) throw error(403, "Invalid dashboard UUID.")
		if (profile.id !== slug && !profile.roles.administrator)
			throw error(403, "You cannot access another scripter dashboard.")

		const form = await superValidate(promises[2], newBundleSchema)
		if (!form.valid) return setError(form, "", "The form is not valid!")

		const scripter = await getScripterDashboard(supabaseServer, slug)

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
		url: { origin, searchParams },
		params: { slug }
	}) => {
		const promises = await Promise.all([getSession(), getProfile(), request.formData()])
		const profile = promises[1]

		if (!promises[0] || !profile) {
			return await doLogin(supabaseServer, origin, new URLSearchParams("login&provider=discord"))
		}

		if (!UUID_V4_REGEX.test(slug)) throw error(403, "Invalid dashboard UUID.")
		if (profile.id !== slug && !profile.roles.administrator)
			throw error(403, "You cannot access another scripter dashboard.")

		const form = await superValidate(promises[2], scriptArraySchema)
		if (!form.valid) return setError(form, "", "The form is not valid!")

		const scripter = await getScripterDashboard(supabaseServer, slug)

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

			if (Math.round(newPrice.amount * 100) !== currentPrice.amount)
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

		return { form }
	},
	scriptAdd: async ({
		request,
		locals: { supabaseServer, getSession, getProfile },
		url: { origin, searchParams },
		params: { slug }
	}) => {
		const promises = await Promise.all([getSession(), getProfile(), request.formData()])
		const profile = promises[1]

		if (!promises[0] || !profile) {
			return await doLogin(supabaseServer, origin, new URLSearchParams("login&provider=discord"))
		}

		if (!UUID_V4_REGEX.test(slug)) throw error(403, "Invalid dashboard UUID.")
		if (profile.id !== slug && !profile.roles.administrator)
			throw error(403, "You cannot access another scripter dashboard.")

		const form = await superValidate(promises[2], newScriptArraySchema)
		if (!form.valid) return setError(form, "", "The form is not valid!")

		const scripter = await getScripterDashboard(supabaseServer, slug)

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
	},

	addFreeAccessB: async ({
		request,
		locals: { supabaseServer, getSession, getProfile },
		url: { origin, searchParams },
		params: { slug }
	}) => {
		const promises = await Promise.all([getSession(), getProfile(), request.formData()])
		const profile = promises[1]

		if (!promises[0] || !profile) {
			return await doLogin(supabaseServer, origin, new URLSearchParams("login&provider=discord"))
		}

		if (!UUID_V4_REGEX.test(slug)) throw error(403, "Invalid dashboard UUID.")
		if (profile.id !== slug && !profile.roles.administrator)
			throw error(403, "You cannot access another scripter dashboard.")

		const data = promises[2]

		const form = await superValidate(data, bundleArraySchema)
		if (!form.valid) return setError(form, "", "The form is not valid!")

		const product = searchParams.get("product")
		if (!product) return setError(form, "", "Product not specified.")

		const id = data.get(product + "_new_free_access_user_id")?.toString()
		if (!id || id === "") return setError(form, "", "User ID not specified.")
		if (!UUID_V4_REGEX.test(id)) return setError(form, "", "User ID is not a valid UUID.")

		const date_end_str = data.get(product + "_new_free_access_end_date")?.toString()
		if (!date_end_str || date_end_str === "") return setError(form, "", "End date not specified.")

		const date_end = new Date(date_end_str).toISOString().toLocaleString()

		const err = await addFreeAccess(supabaseServer, id, product, date_end)

		if (err) {
			console.error(err)
			return setError(form, "", err.message)
		}
		return { form }
	},

	cancelFreeAccessB: async ({
		request,
		locals: { supabaseServer, getSession, getProfile },
		url: { origin, searchParams },
		params: { slug }
	}) => {
		const promises = await Promise.all([getSession(), getProfile(), request.formData()])
		const profile = promises[1]

		if (!promises[0] || !profile) {
			return await doLogin(supabaseServer, origin, new URLSearchParams("login&provider=discord"))
		}

		if (!UUID_V4_REGEX.test(slug)) throw error(403, "Invalid dashboard UUID.")
		if (profile.id !== slug && !profile.roles.administrator)
			throw error(403, "You cannot access another scripter dashboard.")

		const form = await superValidate(promises[2], bundleArraySchema)

		const product = searchParams.get("product")
		if (!product) return setError(form, "", "Product not specified.")

		const id = searchParams.get("id")
		if (!id || id === "") return setError(form, "", "User ID not specified.")
		if (!UUID_V4_REGEX.test(id)) return setError(form, "", "User ID is not a valid UUID.")

		const err = await cancelFreeAccess(supabaseServer, id, product)

		if (err) {
			console.error(err)
			return setError(form, "", err.message)
		}
		return { form }
	},

	addFreeAccessS: async ({
		request,
		locals: { supabaseServer, getSession, getProfile },
		url: { origin, searchParams },
		params: { slug }
	}) => {
		const promises = await Promise.all([getSession(), getProfile(), request.formData()])
		const profile = promises[1]

		if (!promises[0] || !profile) {
			return await doLogin(supabaseServer, origin, new URLSearchParams("login&provider=discord"))
		}

		if (!UUID_V4_REGEX.test(slug)) throw error(403, "Invalid dashboard UUID.")
		if (profile.id !== slug && !profile.roles.administrator)
			throw error(403, "You cannot access another scripter dashboard.")

		const data = promises[2]

		const form = await superValidate(data, scriptArraySchema)
		if (!form.valid) return setError(form, "", "The form is not valid!")

		const product = searchParams.get("product")
		if (!product) return setError(form, "", "Product not specified.")

		const id = data.get(product + "_new_free_access_user_id")?.toString()
		if (!id || id === "") return setError(form, "", "User ID not specified.")
		if (!UUID_V4_REGEX.test(id)) return setError(form, "", "User ID is not a valid UUID.")

		const date_end_str = data.get(product + "_new_free_access_end_date")?.toString()
		if (!date_end_str || date_end_str === "") return setError(form, "", "End date not specified.")

		const date_end = new Date(date_end_str).toISOString().toLocaleString()

		const err = await addFreeAccess(supabaseServer, id, product, date_end)

		if (err) {
			console.error(err)
			return setError(form, "", err.message)
		}
		return { form }
	},

	cancelFreeAccessS: async ({
		request,
		locals: { supabaseServer, getSession, getProfile },
		url: { origin, searchParams },
		params: { slug }
	}) => {
		const promises = await Promise.all([getSession(), getProfile(), request.formData()])
		const profile = promises[1]

		if (!promises[0] || !profile) {
			return await doLogin(supabaseServer, origin, new URLSearchParams("login&provider=discord"))
		}

		if (!UUID_V4_REGEX.test(slug)) throw error(403, "Invalid dashboard UUID.")
		if (profile.id !== slug && !profile.roles.administrator)
			throw error(403, "You cannot access another scripter dashboard.")

		const form = await superValidate(promises[2], scriptArraySchema)

		const product = searchParams.get("product")
		if (!product) return setError(form, "", "Product not specified.")

		const id = searchParams.get("id")
		if (!id || id === "") return setError(form, "", "User ID not specified.")
		if (!UUID_V4_REGEX.test(id)) return setError(form, "", "User ID is not a valid UUID.")

		const err = await cancelFreeAccess(supabaseServer, id, product)

		if (err) {
			console.error(err)
			return setError(form, "", err.message)
		}
		return { form }
	}
}
