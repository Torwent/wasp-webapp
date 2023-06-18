import { createClient } from "@supabase/supabase-js"
import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from "$env/static/public"
import { ADMIN_USER, ADMIN_PASS } from "$env/static/private"
import type { Profile } from "./types"

const credentials = { email: ADMIN_USER, password: ADMIN_PASS }
const options = { auth: { autoRefreshToken: true, persistSession: false } }

//export const supabaseServer = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, options)
export const supabaseAdmin = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, options)

export let adminLoggedIn: boolean = false //login cache.

async function login(cacheOnly: boolean = true) {
	if (adminLoggedIn && cacheOnly) {
		login(false) //make a full async, this should relog if needed.
		return true
	}

	const { data, error } = await supabaseAdmin.auth.getSession()

	if (error) {
		adminLoggedIn = false
		console.error(error)
		return false
	}

	if (data.session == null) {
		console.log("Logging in as admin user!")
		const { error } = await supabaseAdmin.auth.signInWithPassword(credentials)
		if (error) {
			adminLoggedIn = false
			console.error(error)
			return false
		}
	}

	if (!adminLoggedIn) adminLoggedIn = true
	return true
}

export async function updateProfileRoles(profile: Profile) {
	if (!adminLoggedIn) {
		await login(false)
		if (!adminLoggedIn) return false
	}

	const { error } = await supabaseAdmin.rpc("set_user_roles", {
		user_id: profile.id,
		param_developer: profile.profiles_protected.developer,
		param_premium: profile.profiles_protected.premium,
		param_vip: profile.profiles_protected.vip,
		param_tester: profile.profiles_protected.tester,
		param_scripter: profile.profiles_protected.scripter,
		param_moderator: profile.profiles_protected.moderator,
		param_administrator: profile.profiles_protected.administrator
	})

	if (error) {
		console.error(error)
		return false
	}
	return true
}
