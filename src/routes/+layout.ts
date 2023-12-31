import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from "$env/static/public"
import type { Profile } from "$lib/types/collection"
import type { Database } from "$lib/types/supabase"
import { createSupabaseLoadClient } from "@supabase/auth-helpers-sveltekit"
import { error } from "@sveltejs/kit"

export const load = async ({ fetch, data, depends }) => {
	depends("supabase:auth")
	const supabaseClient = createSupabaseLoadClient<Database>({
		supabaseUrl: PUBLIC_SUPABASE_URL,
		supabaseKey: PUBLIC_SUPABASE_ANON_KEY,
		event: { fetch },
		serverSession: data.session
	})

	const {
		data: { session }
	} = await supabaseClient.auth.getSession()

	let profile: Profile | null = null
	if (session) {
		const id = session.user.id
		console.log(id)
		const { data: profileData, error: err } = await supabaseClient
			.schema("profiles")
			.from("profiles")
			.select(
				`id, discord, username, avatar, customer_id,
				 private!private_id_fkey (email, warning),
				 roles!roles_id_fkey (banned, tester, scripter, moderator, administrator),
				 subscription!subscription_id_fkey (subscription, product, price, date_start, date_end, cancel)`
			)
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

		if (profileData.length === 1) profile = profileData[0]
	}

	return { supabaseClient, session, profile: profile }
}
