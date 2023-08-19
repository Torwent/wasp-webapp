import { supabaseAdmin, updateReporters } from "$lib/backend/supabase.server.js"
import { UUID_V4_REGEX } from "$lib/utils.js"
import { error } from "@sveltejs/kit"

export const load = async ({ cookies }) => {
	return { dismissed: cookies.get("warning_dismissed") === "true" }
}

export const actions = {
	clear: async ({ url: { searchParams }, locals: { getProfile } }) => {
		const id = searchParams.get("id")
		if (!id) throw error(403, "No script id was passed!")
		if (!UUID_V4_REGEX.test(id)) throw error(403, "Script id passed is not a valid UUID!")

		const profile = await getProfile()
		if (!profile?.roles.tester || !profile?.roles.moderator || !profile?.roles.administrator)
			throw error(403, "Only testers, mods and admins can clear reports.")

		const { error: err } = await supabaseAdmin
			.schema("scripts")
			.from("protected")
			.update({ broken: false })
			.eq("id", id)

		if (err) {
			console.log("scripts.protected UPDATE failed: ")
			console.error(err)
			throw error(500, err.message)
		}

		return
	},
	report: async ({ url: { searchParams }, locals: { getSession } }) => {
		const id = searchParams.get("id")
		if (!id) throw error(403, "No script id was passed!")
		if (!UUID_V4_REGEX.test(id)) throw error(403, "Script id passed is not a valid UUID!")
		const session = await getSession()
		if (!session) throw error(403, "You need to be logged in to report a broken script.")

		updateReporters(id, session.user.id)

		return
	}
}
