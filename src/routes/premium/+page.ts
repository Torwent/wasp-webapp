import type { Prices } from "$lib/types/collection"
import { error } from "@sveltejs/kit"

export const load = async ({ parent, data }) => {
	async function getScripts() {
		const { supabaseClient } = await parent()
		let query = supabaseClient
			.from("scripts_public")
			.select(`id`, { count: "estimated", head: true })
			.eq("published", true)
			.contains("categories", "{Premium}")

		const { count, error: err } = await query

		if (err) {
			throw error(
				500,
				`Server error, this is probably not an issure on your end! - SELECT scripts failed
			Error code: ${err.code}
			Error hint: ${err.hint}
			Error details: ${err.details}
			Error hint: ${err.message}`
			)
		}

		return count
	}

	async function getPrices() {
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
				`Server error, this is probably not an issure on your end! - SELECT prices failed
			Error code: ${err.code}
			Error hint: ${err.hint}
			Error details: ${err.details}
			Error hint: ${err.message}`
			)
		}

		return data
	}

	return {
		form: data.form,
		prices: getPrices(),
		scripts: getScripts()
	}
}
