import { getScripter } from "$lib/client/supabase"
import type { Price, ProductEx, Script } from "$lib/types/collection"
import { formatError, UUID_V4_REGEX } from "$lib/utils"
import { error } from "@sveltejs/kit"

export const load = async ({
	url,
	params: { slug },
	locals: { supabaseServer, user, getRoles },
	depends
}) => {
	depends("wasp:dashboard")
	if (!user) error(403, "You need to be logged in.")
	if (!UUID_V4_REGEX.test(slug)) error(403, "Invalid dashboard UUID.")

	if (user.id !== slug) {
		const roles = await getRoles()
		if (!roles?.moderator || !roles?.administrator)
			error(403, "You cannot access another scripter dashboard.")
	}

	async function getScripts() {
		const { data, error: err } = await supabaseServer
			.schema("scripts")
			.from("scripts")
			.select(`id, title, url, product, protected!inner (username)`)
			.limit(1, { foreignTable: "protected" })
			.order("title", { ascending: true })
			.contains("categories", "{Premium}")
			.eq("published", true)
			.eq("protected.author_id", slug)
			.overrideTypes<Script[]>()

		if (err) {
			error(
				500,
				"Server error, this is probably not an issue on your end!\n" +
					"SELECT scripts.scripts failed!\n\n" +
					formatError(err)
			)
		}

		const result = []
		for (let i = 0; i < data.length; i++) {
			const script = data[i]
			if (script.protected) {
				result.push({
					id: script.id,
					name: script.title,
					author: script.protected.username,
					url: url.protocol + "//" + url.host + "/" + script.url,
					active: false
				})
			}
		}

		return result
	}

	async function getPrices(products: string[]) {
		const { data, error: err } = await supabaseServer
			.schema("scripts")
			.from("prices")
			.select(`id, product, amount, currency, interval, active`)
			.order("product", { ascending: true })
			.order("amount", { ascending: true })
			.filter("active", "eq", true)
			.in("product", products)
			.overrideTypes<Price[]>()

		if (err) {
			error(
				500,
				"Server error, this is probably not an issue on your end!\n" +
					"SELECT scripts.prices failed!\n\n" +
					formatError(err)
			)
		}

		return data.map((price) => {
			return {
				...price,
				amount: price.amount / 100
			}
		})
	}

	async function getData(products: string[]) {
		const {
			data,
			count,
			error: err
		} = await supabaseServer
			.schema("profiles")
			.from("subscription")
			.select("id, product, price, cancel", { count: "estimated" })
			.in("product", products)

		if (err) {
			error(
				500,
				"Server error, this is probably not an issue on your end!\n" +
					"SELECT product failed!\n\n" +
					formatError(err)
			)
		}

		let cancelling = 0
		data.forEach((sub) => {
			if (sub.cancel) cancelling += 1
		})

		const {
			data: freeData,
			count: freeCount,
			error: freeErr
		} = await supabaseServer
			.schema("profiles")
			.from("free_access")
			.select("id, product", { count: "estimated" })
			.in("product", products)

		if (freeErr) {
			error(
				500,
				"Server error, this is probably not an issue on your end!\n" +
					"SELECT product failed!\n\n" +
					formatError(freeErr)
			)
		}

		return { data, freeData, count: count ?? 0, cancelling, freeCount: freeCount ?? 0 }
	}

	const productIDs: string[] = []

	async function getProducts() {
		const { data, error: err } = await supabaseServer
			.schema("scripts")
			.from("products")
			.select(
				`id, user_id, name, bundle, bundles!products_bundle_fkey (username), script, scripts!products_script_fkey (protected!protected_id_fkey (username)), active`
			)
			.order("id", { ascending: true })
			.eq("user_id", slug)
			.overrideTypes<ProductEx[]>()

		if (err) {
			error(
				500,
				"Server error, this is probably not an issue on your end!\n" +
					"SELECT product failed!\n\n" +
					formatError(err)
			)
		}

		return await Promise.all(
			data.map(async (product) => {
				productIDs.push(product.id)
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
		)
	}

	const promises = await Promise.all([
		getScripts(),
		getScripter(supabaseServer, slug),
		getProducts()
	])

	const lastPromises = await Promise.all([getData(productIDs), getPrices(productIDs)])

	return {
		scripts: promises[0],
		scripter: promises[1],
		products: promises[2],
		data: lastPromises[0],
		prices: lastPromises[1]
	}
}
