import { removeScriptBroken, updateReporters } from "$lib/server/supabase.server"
import { error } from "@sveltejs/kit"

export const load = async ({ cookies }) => {
	return { dismissed: cookies.get("warning_dismissed") === "true" }
}

export const actions = {
	clear: async ({ params: { slug }, locals: { getRoles } }) => {
		const roles = await getRoles()
		if (!roles) error(403, "You need to be logged in to clear reports.")
		if (!roles.tester && !roles.moderator && !roles.administrator) {
			error(403, "Only testers, moderators and administrators can clear reports.")
		}
		return { success: await removeScriptBroken(slug) }
	},
	report: async ({ params: { slug }, locals: { user } }) => {
		if (!user) error(403, "You need to be logged in to report a broken script.")
		return { success: await updateReporters(slug, user.id) }
	}
}
