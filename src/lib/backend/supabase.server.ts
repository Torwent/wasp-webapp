import { createClient } from "@supabase/supabase-js"
import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from "$env/static/public"
import { ADMIN_USER, ADMIN_PASS, PRIVATE_STRIPE_KEY } from "$env/static/private"
import type { Profile, UpdateScriptStats } from "$lib/types/collection"
import { error } from "@sveltejs/kit"
import Stripe from "stripe"

const credentials = { email: ADMIN_USER, password: ADMIN_PASS }
const options = { auth: { autoRefreshToken: true, persistSession: false } }

export const supabaseAdmin = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, options)

export let adminLoggedIn: boolean = false //login cache.

async function login(cacheOnly: boolean = true) {
	if (adminLoggedIn && cacheOnly) {
		login(false) //make a full async run, this should relog if needed.
		return true
	}

	const { data, error: err } = await supabaseAdmin.auth.getSession()

	if (err) {
		adminLoggedIn = false
		throw error(403, err)
	}

	if (data.session == null) {
		console.log("Logging in as admin user!")
		const { error: err } = await supabaseAdmin.auth.signInWithPassword(credentials)
		if (err) {
			adminLoggedIn = false
			throw error(403, err)
		}
	}

	if (!adminLoggedIn) adminLoggedIn = true
	return true
}

export async function getProfile(id: string) {
	if (!adminLoggedIn) {
		await login(false)
		if (!adminLoggedIn) return false
	}

	const { data, error } = await supabaseAdmin
		.from("profiles_public")
		.select(`*, profiles_protected (*), profiles_private (*)`)
		.eq("id", id)
		.returns<Profile[]>()
	if (error || data.length < 1) return null
	return data[0]
}

export async function updateProfileProtected(profile: Profile) {
	if (!adminLoggedIn) {
		await login(false)
		if (!adminLoggedIn) return false
	}

	console.log("Updating profile protected for user: ", profile)

	const { error: err } = await supabaseAdmin
		.from("profiles_protected")
		.update({
			cancel_at_period_end: profile.profiles_protected.cancel_at_period_end,
			customer_id: profile.profiles_protected.customer_id,
			developer: profile.profiles_protected.developer,
			premium: profile.profiles_protected.premium,
			price_id: profile.profiles_protected.price_id,
			scripter: profile.profiles_protected.scripter,
			subscription_end: profile.profiles_protected.subscription_end,
			subscription_external: profile.profiles_protected.subscription_external,
			subscription_id: profile.profiles_protected.subscription_id,
			subscription_start: profile.profiles_protected.subscription_start,
			tester: profile.profiles_protected.tester,
			timeout: profile.profiles_protected.timeout,
			unlocked_ips: profile.profiles_protected.unlocked_ips,
			vip: profile.profiles_protected.vip
		})
		.eq("id", profile.id)

	if (err) {
		console.error(err)
		throw error(403, err)
	}
	return true
}

export async function updateDownloaders(script: string, user: string) {
	if (!adminLoggedIn) {
		await login(false)
		if (!adminLoggedIn) return false
	}

	const { error: err } = await supabaseAdmin
		.schema("scripts")
		.rpc("add_downloader", { script_id: script, user_id: user })

	if (err) {
		console.error(err)
		throw error(
			500,
			`Server error, this is probably not an issure on your end! - UPDATE scripts.stats_site failed
			Function name: add_downloaders
			Error code: ${err.code}
			Error hint: ${err.hint}
			Error details: ${err.details}
			Error hint: ${err.message}`
		)
	}

	return true
}

export async function updateReporters(script: string, user: string) {
	if (!adminLoggedIn) {
		await login(false)
		if (!adminLoggedIn) return false
	}

	const { error: err } = await supabaseAdmin
		.schema("scripts")
		.rpc("add_reporters", { script_id: script, user_id: user })

	if (err) {
		console.error(err)
		throw error(
			500,
			`Server error, this is probably not an issure on your end! - UPDATE scripts.stats_site failed
			Function name: add_downloaders
			Error code: ${err.code}
			Error hint: ${err.hint}
			Error details: ${err.details}
			Error hint: ${err.message}`
		)
	}

	return true
}

export const stripe = new Stripe(PRIVATE_STRIPE_KEY, { apiVersion: "2022-11-15", typescript: true })
