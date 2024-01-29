import type { ScriptSimple } from "$lib/types/collection"
import { error } from "@sveltejs/kit"

export const load = async ({ parent, data }) => {
	const { supabaseClient } = await parent()

	async function getPrices() {
		const { data, error: err } = await supabaseClient
			.schema("scripts")
			.from("prices")
			.select(`id, product, amount, currency, interval, active`)
			.order("product", { ascending: true })
			.order("amount", { ascending: true })

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

	async function getProducts() {
		const { data, error: err } = await supabaseClient
			.schema("scripts")
			.from("products")
			.select(
				`id, user_id, name, bundle,
				 bundles!products_bundle_fkey (username), script,
				 scripts!products_script_fkey (url, protected!protected_id_fkey (username)),
				 active`
			)
			.order("bundle", { ascending: true })
			.order("user_id", { ascending: true })
			.order("name", { ascending: true })

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
				username: product.bundles?.username ?? product.scripts?.protected?.username ?? "",
				bundle: product.bundle,
				script: product.script,
				active: product.active
			}
		})
		return result
	}

	async function getScripts() {
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
				`Server error, this is probably not an issue on your end! - SELECT prices failed
			Error code: ${err.code}
			Error hint: ${err.hint}
			Error details: ${err.details}
			Error hint: ${err.message}`
			)
		}

		return data
	}

	async function getBundles() {
		const { data, error: err } = await supabaseClient
			.schema("scripts")
			.from("bundles")
			.select(`id, name, scripts, quantity, user_id, username, product`)
			.order("name", { ascending: true })

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

	async function getData() {
		const promises = await Promise.all([getPrices(), getProducts(), getBundles(), getScripts()])
		const prices = promises[0]
		const tmpPrices = [...prices]
		const products = promises[1]
		const bundles = promises[2]
		const scripts = promises[3]

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
					active: product.active,
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
					active: product.active
				})
			}
		}

		return { bundles: bundleProduct, scripts: scriptProduct, prices }
	}

	return {
		subscriptionsform: data.subscriptionsform,
		checkoutForm: data.checkoutForm,
		data: await getData()
	}
}
