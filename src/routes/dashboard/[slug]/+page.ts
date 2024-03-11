import { getScripterDashboard } from "$lib/backend/data"
import type { Prices, ProductEx, Profile, Script } from "$lib/types/collection"
import { UUID_V4_REGEX } from "$lib/utils"
import { error } from "@sveltejs/kit"

export const load = async ({ parent, data, depends, url, params: { slug } }) => {
	const { profile, supabaseClient } = await parent()

	if (!profile) throw error(403, "You need to be logged in.")
	if (!UUID_V4_REGEX.test(slug)) throw error(403, "Invalid dashboard UUID.")
	if (profile.id !== slug && !profile.roles.administrator)
		throw error(403, "You cannot access another scripter dashboard.")

	depends("waspscripts:dashboard")

	const bundlesForm = data.bundlesForm
	const newBundleForm = data.newBundleForm
	const scriptsForm = data.scriptsForm
	const newScriptForm = data.newScriptForm

	async function getSubscriptions(product: string) {
		const {
			data,
			count,
			error: err
		} = await supabaseClient
			.schema("profiles")
			.from("subscription")
			.select("id, product, price, cancel", { count: "estimated" })
			.eq("product", product)

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

		let cancelling = 0
		data.forEach((sub) => {
			if (sub.cancel) cancelling += 1
		})

		const { count: freeCount, error: freeErr } = await supabaseClient
			.schema("profiles")
			.from("free_access")
			.select("id", { count: "estimated" })
			.eq("product", product)

		if (freeErr) {
			console.error(freeErr)
			throw error(
				500,
				`Server error, this is probably not an issue on your end! - SELECT product failed
			Error code: ${freeErr.code}
			Error hint: ${freeErr.hint}
			Error details: ${freeErr.details}
			Error hint: ${freeErr.message}`
			)
		}

		return { product: product, data, count: count ?? 0, cancelling, free: freeCount ?? 0 }
	}

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
				`Server error, this is probably not an issue on your end! - SELECT scripts.prices failed
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

		return data.map((product) => {
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
	}

	async function getStats() {
		const { data, error: err } = await supabaseClient
			.schema("scripts")
			.rpc("get_site_stats", { user_id: slug })
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
				`Server error, this is probably not an issue on your end! - SELECT scripts.bundles failed
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
				`Server error, this is probably not an issue on your end! - SELECT scripts.scripts failed
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
				url: url.protocol + "//" + url.host + "/" + script.url,
				active: false
			}
		})
	}

	async function getData() {
		const promises = await Promise.all([
			getProducts(slug),
			getBundles(slug),
			getScripts(slug),
			getPrices()
		])

		const products = promises[0]
		const bundles = promises[1]
		const scripts = promises[2]
		const prices = promises[3]

		const tmpScripts = [...scripts]
		bundlesForm.data.bundles = []
		scriptsForm.data.scripts = []

		const bundleSubsPromises = []
		const scriptSubsPromises = []

		for (let index = 0; index < products.length; index++) {
			const product = products[index]

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
				bundleSubsPromises.push(getSubscriptions(product.id))
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
				scriptSubsPromises.push(getSubscriptions(product.id))
				const i = tmpScripts.findIndex((script) => script.id === product.script)
				if (i > -1) {
					scriptsForm.data.scripts.push({
						id: product.id,
						script: product.script,
						user_id: product.user_id,
						name: product.name,
						author: product.username,
						url: tmpScripts[i].url,
						prices: productPrices
					})
					tmpScripts.splice(i, 1)
				}
			}
		}

		newScriptForm.data.newScripts = tmpScripts.map((script) => {
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

		const awaitedSubs = await Promise.all([
			Promise.all(bundleSubsPromises),
			Promise.all(scriptSubsPromises)
		])

		const totalSubs = { subscribers: 0, cancelling: 0, free_access: 0 }

		awaitedSubs[0].forEach((sub) => {
			totalSubs.subscribers += sub.count
			totalSubs.cancelling += sub.cancelling
			totalSubs.free_access += sub.free
		})

		awaitedSubs[1].forEach((sub) => {
			totalSubs.subscribers += sub.count
			totalSubs.cancelling += sub.cancelling
			totalSubs.free_access += sub.free
		})

		return {
			total: totalSubs,
			bundles: awaitedSubs[0],
			scripts: awaitedSubs[1]
		}
	}

	const promises = await Promise.all([
		getScripterDashboard(supabaseClient, slug),
		getStats(),
		getData()
	])

	const scripter = promises[0]

	newBundleForm.data.name = "Bundle name"
	newBundleForm.data.author = scripter.profiles.username
	newBundleForm.data.user_id = slug
	newBundleForm.data.prices = [
		{ amount: 4, currency: "eur", interval: "week" },
		{ amount: 7.5, currency: "eur", interval: "month" },
		{ amount: 50, currency: "eur", interval: "year" }
	]

	const stripeAccount = data.stripeAccount?.stripeAccount ?? null
	const stripeBalance = data.stripeAccount?.stripeBalance ?? null
	const dbaForm = data.dbaForm

	dbaForm.data.dba = stripeAccount?.business_profile?.name ?? ""

	return {
		stripeAccount,
		stripeBalance,
		stripeSession: data.stripeSession,
		countryForm: data.countryForm,
		dbaForm,
		bundlesForm,
		newBundleForm,
		scriptsForm,
		newScriptForm,
		profile,
		scripter,
		stats: promises[1],
		subscriptions: promises[2]
	}
}
