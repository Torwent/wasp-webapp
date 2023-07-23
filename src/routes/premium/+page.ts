import type { SupabaseClient } from "@supabase/supabase-js"
import { error } from "@sveltejs/kit"

async function getScripts(supabase: SupabaseClient) {
	let query = supabase
		.from("scripts_public")
		.select(`id`, { count: "exact" })
		.eq("published", true)
		.contains("categories", "{Premium}")

	const { data, error: err } = await query

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

	return data.length
}

export const load = async ({ parent, data }) => {
	const { supabaseClient } = await parent()
	if (!data) throw error(403, "Failed to retrieve data from the server!")

	return {
		prices: data.prices.data,
		subscription: data.subscription,
		scripts: getScripts(supabaseClient),
		form: data.form
	}
}
