import { getServerSession } from "@supabase/auth-helpers-sveltekit"
import type { LayoutServerLoad } from "./$types"

export const load: LayoutServerLoad = async (event) => {
	event.depends("supabase:auth")
	return {
		session: getServerSession(event),
		profile: event.locals.getProfile()
	}
}
