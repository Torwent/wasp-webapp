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

	return {
		form: data.form,
		prices: data.prices,
		subscription: data.subscription,
		scripts: getScripts()
	}
}
