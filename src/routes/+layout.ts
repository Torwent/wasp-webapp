import { sbClient } from "$lib/backend/auth"
import type { LayoutLoad } from "./$types"

export const load: LayoutLoad = async ({ url, data }) => {
	//const didLogin = url.searchParams.has("/login")
	const didLogout = url.searchParams.has("/logout")
	if (didLogout) await sbClient.auth.signOut()

	return data
}
