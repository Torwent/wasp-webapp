import { getScripterUUID } from "$lib/backend/data"
import { error } from "@sveltejs/kit"

export const load = async ({ parent }) => {
	const { profile, supabaseClient } = await parent()

	if (!profile?.roles.scripter) throw error(403, "This page is only for scripters.")
	const { data, error: err } = await supabaseClient
		.schema("scripts")
		.rpc("get_site_stats", { user_id: profile.id })

	if (err) {
		throw error(400, err)
	}

	return { profile, developer: getScripterUUID(supabaseClient, profile.id), stats: data[0] }
}
