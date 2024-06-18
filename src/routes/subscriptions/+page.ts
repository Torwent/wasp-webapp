import { streamedErrorHandler } from "$lib/client/utils.js"
import type { ProductData, ScriptSimple } from "$lib/types/collection"
import { formatError } from "$lib/utils.js"
import { error } from "@sveltejs/kit"

export const load = async ({ parent, data }) => {
	const { subscriptionsform, checkoutForm } = data

	async function getPrices() {
		const { supabaseClient } = await parent()
		const { data, error: err } = await supabaseClient
			.schema("scripts")
			.from("prices")
			.select(`id, product, amount, currency, interval, active`)
			.order("product", { ascending: true })
			.order("amount", { ascending: true })

		if (err) {
			throw error(
				500,
				"Server error, this is probably not an issue on your end!\n" +
					"SELECT scripts.prices failed!\n\n" +
					formatError(err)
			)
		}

		return data
	}

	interface User {
		id: string
		username: string
	}

	const cachedUsers: User[] = []

	async function getProfile(id: string) {
		const user = cachedUsers.find((user) => user.id === id)
		if (user) return user.username

		const { supabaseClient } = await parent()
		const { data, error: err } = await supabaseClient
			.schema("profiles")
			.from("profiles")
			.select(`username`)
			.eq("id", id)
			.single()

		if (err) {
			throw error(
				500,
				"Server error, this is probably not an issue on your end!\n" +
					"SELECT profiles.profiles failed!\n\n" +
					formatError(err)
			)
		}

		cachedUsers.push({ id: id, username: data.username })
		return data.username
	}

	async function getProducts() {
		const { supabaseClient } = await parent()
		const { data, error: err } = await supabaseClient
			.schema("scripts")
			.from("products")
			.select(`id, user_id, name, bundle, script, active`)
			.order("bundle", { ascending: true })
			.order("user_id", { ascending: true })
			.order("name", { ascending: true })
			.returns<ProductData[]>()

		if (err) {
			throw error(
				500,
				"Server error, this is probably not an issue on your end!\n" +
					"SELECT scripts.products failed!\n\n" +
					formatError(err)
			)
		}

		return await Promise.all(
			data.map(async (product) => {
				return {
					id: product.id,
					user_id: product.user_id,
					name: product.name,
					username: getProfile(product.user_id),
					bundle: product.bundle,
					script: product.script,
					active: product.active
				}
			})
		)
	}

	async function getScripts() {
		const { supabaseClient } = await parent()
		const { data, error: err } = await supabaseClient
			.schema("scripts")
			.from("scripts")
			.select(`id, title, url, product, protected!left (username)`)
			.limit(1, { foreignTable: "protected" })
			.eq("published", true)
			.contains("categories", "{Premium}")
			.order("title", { ascending: true })
			.returns<ScriptSimple[]>()

		if (err) {
			throw error(
				500,
				"Server error, this is probably not an issue on your end!\n" +
					"SELECT scripts.scripts failed!\n\n" +
					formatError(err)
			)
		}

		return data
	}

	async function getBundles() {
		const { supabaseClient } = await parent()
		const { data, error: err } = await supabaseClient
			.schema("scripts")
			.from("bundles")
			.select(`id, name, scripts, quantity, user_id, username, product`)
			.order("name", { ascending: true })

		if (err) {
			throw error(
				500,
				"Server error, this is probably not an issue on your end!\n" +
					"SELECT scripts.bundles failed!\n\n" +
					formatError(err)
			)
		}

		return data
	}

	const pricesPromise = getPrices()
	pricesPromise.catch((err) => streamedErrorHandler(err))

	async function getData() {
		const promises = await Promise.all([getProducts(), getBundles(), getScripts()])
		const prices = await pricesPromise
		const tmpPrices = [...prices]
		const products = promises[0]
		const bundles = promises[1]
		const scripts = promises[2]

		const bundleProduct = []
		const scriptProduct = []

		for (let i = 0; i < products.length; i++) {
			const product = products[i]
			const productPrices = []
			let currentBundle
			const bundledScripts = []
			let scriptURL: string = ""

			for (let j = 0; j < tmpPrices.length; j++) {
				if (!tmpPrices[j].active || tmpPrices[j].product !== product.id) continue

				productPrices.push({
					id: tmpPrices[j].id,
					product: tmpPrices[j].product,
					amount: tmpPrices[j].amount,
					interval: tmpPrices[j].interval,
					currency: tmpPrices[j].currency,
					active: productPrices.length === 0
				})

				tmpPrices.splice(j, 1)
				j--
			}

			for (let j = 0; j < bundles.length; j++) {
				if (bundles[j].product !== product.id) continue
				currentBundle = bundles[j]
				bundles.splice(j, 1)
				break
			}

			data.checkoutForm.data.products[i] = { id: product.id, prices: productPrices }

			const tmpScripts = [...scripts]

			if (currentBundle) {
				for (let l = 0; l < currentBundle.scripts.length; l++) {
					for (let j = 0; j < tmpScripts.length; j++) {
						if (currentBundle.scripts[l] !== tmpScripts[j].id) continue
						bundledScripts.push(tmpScripts[j])
						tmpScripts.splice(j, 1)
						j--
						break
					}
					currentBundle.scripts.splice(l, 1)
					l--
				}
			} else {
				for (let j = 0; j < tmpScripts.length; j++) {
					if (product.script !== tmpScripts[j].id) continue
					scriptURL = tmpScripts[j].url as string
					tmpScripts.splice(j, 1)
					j--
					break
				}
			}

			if (product.bundle) {
				bundleProduct.push({
					id: product.id,
					user_id: product.user_id,
					name: product.name,
					username: product.username,
					bundle: product.bundle,
					prices: productPrices,
					scripts: bundledScripts,
					active: product.active && productPrices.length > 0,
					open: false
				})
			} else if (product.script) {
				scriptProduct.push({
					id: product.id,
					user_id: product.user_id,
					name: product.name,
					username: product.username,
					url: scriptURL,
					prices: productPrices,
					active: product.active && productPrices.length > 0
				})
			}
		}

		return { bundles: bundleProduct, scripts: scriptProduct }
	}

	const pageDataPromise = getData()
	pageDataPromise.catch((err) => streamedErrorHandler(err))

	return {
		subscriptionsform,
		checkoutForm,
		pageDataPromise,
		pricesPromise,
		subscriptionsPromise: data.subscriptions,
		freeAccessPromise: data.freeAccess
	}
}
