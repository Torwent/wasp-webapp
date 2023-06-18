import { supabaseClient } from "$lib/backend/auth"
export const load = async ({ url, data }) => {
	//const didLogin = url.searchParams.has("/login")
	const didLogout = url.searchParams.has("/logout")
	if (didLogout) await supabaseClient.auth.signOut()

	return data
}
