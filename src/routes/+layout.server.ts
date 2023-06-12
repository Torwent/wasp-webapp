import { getServerSession } from "@supabase/auth-helpers-sveltekit"
import type { LayoutServerLoad } from "./$types"

export const load: LayoutServerLoad = async (event) => {
	event.depends("supabase:auth")
	const session = getServerSession(event)
	const profile = event.locals.getProfile()
	return { session, profile }
}
