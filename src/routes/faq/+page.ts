export const load = async ({ parent }) => {
	const { supabaseClient } = await parent()

	async function getFAQ(table: string) {
		const { data, error: err } = await supabaseClient
			.schema("info")
			.from(table)
			.select("title, content")
			.order("id")

		if (err) {
			console.error(err)
			return []
		}

		return data
	}

	return { questions: getFAQ("questions"), errors: getFAQ("errors") }
}
