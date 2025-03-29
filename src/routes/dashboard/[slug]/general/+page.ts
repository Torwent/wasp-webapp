import type { ScripterStats } from "$lib/types/collection"
import { UUID_V4_REGEX, formatError } from "$lib/utils"
import { error } from "@sveltejs/kit"

export const load = async ({ parent, params: { slug } }) => {
	const { user, roles, supabaseClient, data } = await parent()
	if (!user) error(403, "You need to be logged in.")
	if (!UUID_V4_REGEX.test(slug)) error(403, "Invalid dashboard UUID.")
	if (user.id !== slug && !roles?.administrator)
		error(403, "You cannot access another scripter dashboard.")

	async function getStats() {
		const { data, error: err } = await supabaseClient
			.schema("scripts")
			.rpc("get_site_stats", { user_id: slug })
			.single<ScripterStats>()

		if (err) {
			error(
				500,
				"Server error, this is probably not an issue on your end!\n" +
					"SELECT get_site_stats postgres function failed!\n\n" +
					formatError(err)
			)
		}

		return data
	}

	return {
		stats: await getStats(),
		subscriptions: {
			subscribers: data.count,
			cancelling: data.cancelling,
			free_access: data.freeCount
		}
	}
}
