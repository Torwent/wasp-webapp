import type { Prices } from "$lib/types/collection"
import { error } from "@sveltejs/kit"
import { get, writable } from "svelte/store"

const pricesStore = writable<Prices[] | null>(null)

export const load = async ({ parent, data }) => {
	async function getScriptTotals() {
		const { supabaseClient } = await parent()
		const query = supabaseClient
			.schema("scripts")
			.from("scripts")
			.select(`id`, { count: "estimated", head: true })
			.eq("published", true)
			.contains("categories", "{Premium}")

		const { count, error: err } = await query

		if (err) {
			throw error(
				500,
				`Server error, this is probably not an issue on your end! - SELECT scripts failed
			Error code: ${err.code}
			Error hint: ${err.hint}
			Error details: ${err.details}
			Error hint: ${err.message}`
			)
		}

		return count
	}

	async function getPrices() {
		let result = get(pricesStore)
		if (!result) {
			const { supabaseClient } = await parent()
			const { data, error: err } = await supabaseClient
				.from("prices")
				.select(`stripe_id, stripe_product, amount, currency, interval`)
				.eq("stripe_product", "prod_OJdmhvyX05puAr")
				.order("amount", { ascending: true })
				.returns<Prices[]>()

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

			result = data
			pricesStore.set(result)
		}
		return result
	}

	return {
		form: data.form,
		prices: getPrices(),
		scripts: { total: getScriptTotals() }
	}
}
