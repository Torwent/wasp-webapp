import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from "$env/static/public"
import { SupabaseClient, createClient } from "@supabase/supabase-js"

let supabase: SupabaseClient | null

const getSupabase = (
	fetch: (input: URL | RequestInfo, init?: RequestInit | undefined) => Promise<Response>
) => {
	if (!supabase)
		supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
			global: { fetch: fetch.bind(globalThis) },
			auth: { autoRefreshToken: true, persistSession: true, detectSessionInUrl: true }
		})
	return supabase
}

export const load = async ({ fetch, data, depends }) => {
	depends("supabase:auth")
	const supabaseClient = getSupabase(fetch)

	if (data.session) {
		await supabaseClient.auth.setSession(data.session)
	} else await supabaseClient.auth.signOut()

	const {
		data: { session }
	} = await supabaseClient.auth.getSession()

	return { supabaseClient, session, serverSession: data.session, profile: data.profile }
}
