import { getServerSession } from "@supabase/auth-helpers-sveltekit"

export const load = async (event) => {
	event.depends("supabase:auth")
	const session = getServerSession(event)
	const profile = event.locals.getProfile()
	return { session, profile }
}
