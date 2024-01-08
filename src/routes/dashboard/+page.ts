import { getScripterDashboard } from "$lib/backend/data"
import type { Prices, ProductEx, Profile, Script } from "$lib/types/collection"
import { error } from "@sveltejs/kit"

export const load = async ({ parent, data, depends, url }) => {
	const { profile, supabaseClient } = await parent()
	if (!profile) throw error(403, "You need to be logged in.")

	depends("dashboard")

	const bundlesForm = data.bundlesForm
	const newBundleForm = data.newBundleForm
	const scriptsForm = data.scriptsForm
	const newScriptForm = data.newScriptForm

	async function getPrices() {
		const { data, error: err } = await supabaseClient
			.schema("scripts")
			.from("prices")
			.select(`id, product, amount, currency, interval, active`)
			.order("product", { ascending: true })
			.order("amount", { ascending: true })
			.filter("active", "eq", true)
			.returns<Prices[]>()

		if (err) {
			console.error(err)
			throw error(
				500,
				`Server error, this is probably not an issue on your end! - SELECT prices failed
			Error code: ${err.code}
			Error hint: ${err.hint}
			Error details: ${err.details}
			Error hint: ${err.message}`
			)
		}

		return data
	}

	async function getProducts(user_id: string) {
		const { data, error: err } = await supabaseClient
			.schema("scripts")
			.from("products")
			.select(
				`id, user_id, name, bundle, bundles!products_bundle_fkey (username), script, scripts!products_script_fkey (protected!protected_id_fkey (username)), active`
			)
			.order("id", { ascending: true })
			.eq("user_id", user_id)
			.returns<ProductEx[]>()

		if (err) {
			console.error(err)
			throw error(
				500,
				`Server error, this is probably not an issue on your end! - SELECT product failed
			Error code: ${err.code}
			Error hint: ${err.hint}
			Error details: ${err.details}
			Error hint: ${err.message}`
			)
		}

		const result = data.map((product) => {
			return {
				id: product.id,
				user_id: product.user_id,
				name: product.name,
				username: product.bundles?.username ?? product.scripts?.protected.username ?? "",
				bundle: product.bundle,
				script: product.script,
				active: product.active
			}
		})
		return result
	}

	async function getStats(profile: Profile) {
		if (!profile.roles.scripter) throw error(403, "This page is only for scripters.")
		const { data, error: err } = await supabaseClient
			.schema("scripts")
			.rpc("get_site_stats", { user_id: profile.id })
			.single()

		if (err) {
			throw error(400, err)
		}

		return data
	}

	async function getBundles(id: string) {
		const { data, error: err } = await supabaseClient
			.schema("scripts")
			.from("bundles")
			.select(`id, name, scripts, quantity, user_id, username, product`)
			.order("name", { ascending: true })
			.eq("user_id", id)

		if (err) {
			throw error(
				500,
				`Server error, this is probably not an issue on your end! - SELECT prices failed
			Error code: ${err.code}
			Error hint: ${err.hint}
			Error details: ${err.details}
			Error hint: ${err.message}`
			)
		}

		return data
	}

	async function getScripts(user_id: string) {
		const { data, error: err } = await supabaseClient
			.schema("scripts")
			.from("scripts")
			.select(`id, title, url, product, protected!inner (username)`)
			.limit(1, { foreignTable: "protected" })
			.order("title", { ascending: true })
			.contains("categories", "{Premium}")
			.eq("published", true)
			.eq("protected.author_id", user_id)
			.returns<Script[]>()

		if (err) {
			throw error(
				500,
				`Server error, this is probably not an issue on your end! - SELECT prices failed
			Error code: ${err.code}
			Error hint: ${err.hint}
			Error details: ${err.details}
			Error hint: ${err.message}`
			)
		}

		return data.map((script) => {
			return {
				id: script.id,
				name: script.title,
				author: script.protected.username,
				url: url.protocol + "//" + url.host + "/" + script.url ?? "",
				active: false
			}
		})
	}

	async function getData(profile: Profile) {
		const user_id = profile.id
		const promises = await Promise.all([
			getProducts(user_id),
			getBundles(user_id),
			getScripts(user_id),
			getPrices()
		])

		const products = promises[0]
		const bundles = promises[1]
		const scripts = promises[2]
		const prices = promises[3]

		const tmpScripts = [...scripts]
		bundlesForm.data.bundles = []
		scriptsForm.data.scripts = []

		products.forEach((product) => {
			const productPrices = [...prices].reduce<Prices[]>((acc, price, i) => {
				if (acc.length > 2) return acc
				if (price.product === product.id) {
					price.amount = price.amount / 100
					prices.splice(i - acc.length, 1)
					acc.push(price)
				}
				return acc
			}, [])

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

			if (product.bundle) {
				const i = bundles.findIndex((bundle) => bundle.product === product.id)
				bundlesForm.data.bundles.push({
					id: product.id,
					name: product.name,
					author: product.username,
					prices: productPrices,
					bundledScripts: scripts.map((script) => {
						return {
							id: script.id,
							name: script.name,
							author: script.author,
							url: script.url,
							active: bundles[i].scripts.includes(script.id)
						}
					}),
					open: false
				})
				bundles.splice(i, 1)
			} else if (product.script) {
				const i = tmpScripts.findIndex((script) => script.id === product.script)
				tmpScripts.splice(i, 1)

				scriptsForm.data.scripts.push({
					id: product.id,
					script: product.script,
					user_id: product.user_id,
					name: product.name,
					author: product.username,
					url: tmpScripts[i].url,
					prices: productPrices
				})
			}
		})

		newScriptForm.data.scripts = tmpScripts.map((script) => {
			return {
				id: script.id,
				name: script.name,
				author: script.author,
				url: script.url ?? "",
				prices: [
					{ amount: 0, currency: "eur", interval: "week" },
					{ amount: 0, currency: "eur", interval: "month" },
					{ amount: 0, currency: "eur", interval: "year" }
				]
			}
		})

		newBundleForm.data.bundledScripts = scripts.map((script) => {
			return {
				id: script.id,
				name: script.name,
				author: script.author,
				url: script.url ?? "",
				active: script.active
			}
		})
	}

	newBundleForm.data.name = "Bundle name"
	newBundleForm.data.author = profile.username
	newBundleForm.data.user_id = profile.id
	newBundleForm.data.prices = [
		{ amount: 4, currency: "eur", interval: "week" },
		{ amount: 7.5, currency: "eur", interval: "month" },
		{ amount: 50, currency: "eur", interval: "year" }
	]

	const promises = await Promise.all([
		getScripterDashboard(supabaseClient, profile.id),
		getStats(profile),
		getData(profile)
	])

	return {
		stripeSession: data.stripeSession,
		countryForm: data.countryForm,
		bundlesForm,
		newBundleForm,
		scriptsForm,
		newScriptForm,
		profile,
		scripter: promises[0],
		stats: promises[1]
	}
}
