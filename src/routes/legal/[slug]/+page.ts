import { streamedErrorHandler } from "$lib/client/utils.js"
import { formatError } from "$lib/utils"
import { error } from "@sveltejs/kit"

export const load = async ({ parent, params: { slug } }) => {
	async function getInfo() {
		const { supabaseClient } = await parent()

		const schema = "info"
		const { data, error: err } = await supabaseClient
			.schema(schema)
			.from(slug)
			.select("version, created_at, content")
			.order("version", { ascending: false })

		if (err) {
			error(
				500,
				"Server error, this is probably not an issue on your end!\n" +
					"SELECT info." +
					slug +
					" failed!\n\n" +
					formatError(err)
			)
		}

		return data
	}

	const policiesPromise = getInfo()
	policiesPromise.catch((err) => streamedErrorHandler(err))

	return { policiesPromise }
}
