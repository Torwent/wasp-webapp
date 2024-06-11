import { error } from "@sveltejs/kit"

export const load = async ({ parent }) => {
	const { supabaseClient } = await parent()

	const schema = "info"
	const table = "scripter_tos"
	const { data, error: infoError } = await supabaseClient
		.schema(schema)
		.from(table)
		.select("version, created_at, content")
		.order("version", { ascending: false })

	if (infoError) {
		error(
			500,
			`Server error, this is probably not an issue on your end! - SELECT ${schema}.${table} failed
			Error code: ${infoError.code}
			Error hint: ${infoError.hint}
			Error details: ${infoError.details}
			Error hint: ${infoError.message}`
		)
	}

	return { terms: data }
}
