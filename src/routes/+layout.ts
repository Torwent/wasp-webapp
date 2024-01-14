import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from "$env/static/public"
import type { Profile } from "$lib/types/collection"
import type { Database } from "$lib/types/supabase"
import { profileQuery } from "$lib/utils"
import { createBrowserClient, isBrowser, parse } from "@supabase/ssr"
import type { Session, SupabaseClient } from "@supabase/supabase-js"
import { error } from "@sveltejs/kit"

async function getProfile(supabase: SupabaseClient, session: Session) {
	const id = session.user.id
	const { data: profileData, error: err } = await supabase
		.schema("profiles")
		.from("profiles")
		.select(profileQuery)
		.eq("id", id)
		.limit(1)
		.limit(1, { foreignTable: "private" })
		.limit(1, { foreignTable: "roles" })
		.returns<Profile[]>()

	if (err) {
		console.error(err)
		throw error(
			500,
			`Server error, this is probably not an issue on your end! - SELECT prices failed
			Error code: ${err.code}
			Error hint: ${err.hint}
			Error details: ${err.details}
			Error hint: ${err.message}`
		)
	}

	return profileData.length === 1 ? profileData[0] : null
}

export const load = async ({ fetch, data, depends }) => {
	depends("supabase:auth")
	const supabaseClient = createBrowserClient<Database>(
		PUBLIC_SUPABASE_URL,
		PUBLIC_SUPABASE_ANON_KEY,
		{
			global: {
				fetch
			},
			cookies: {
				get(key) {
					if (!isBrowser()) {
						return JSON.stringify(data.session)
					}

					const cookie = parse(document.cookie)
					return cookie[key]
				}
			}
		}
	)

	const {
		data: { session }
	} = await supabaseClient.auth.getSession()

	let profile = session ? await getProfile(supabaseClient, session) : null

	return { supabaseClient, session, profile: profile }
}
