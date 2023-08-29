import { createClient } from "@supabase/supabase-js"
import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from "$env/static/public"
import { ADMIN_USER, ADMIN_PASS, PRIVATE_STRIPE_KEY } from "$env/static/private"
import type { Profile } from "$lib/types/collection"
import { error } from "@sveltejs/kit"
import Stripe from "stripe"

const credentials = { email: ADMIN_USER, password: ADMIN_PASS }
const options = { auth: { autoRefreshToken: true, persistSession: false } }

export const supabaseAdmin = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, options)

export let adminLoggedIn = false //login cache.

async function login(cacheOnly = true) {
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
		.schema("profiles")
		.from("profiles")
		.select(
			`id, discord, username, avatar, email, customer_id, private!left (email, warning),
				roles!left (banned, timeout, developer, premium, vip, tester, scripter, moderator, administrator),
				subscriptions!left (external, subscription_id, cancel, price_id, date_start, date_end)`
		)
		.eq("id", id)
		.limit(1)
		.limit(1, { foreignTable: "private" })
		.limit(1, { foreignTable: "roles" })
		.limit(1, { foreignTable: "subscriptions" })
		.returns<Profile[]>()

	if (error || data.length < 1) return null
	return data[0]
}

export async function updateCustomerID(id: string, customer_id: string) {
	if (!adminLoggedIn) {
		await login(false)
		if (!adminLoggedIn) return false
	}

	console.log("Updating profiles.profiles for user: ", id)

	const { error: err } = await supabaseAdmin
		.schema("profiles")
		.from("profiles")
		.update({ customer_id: customer_id })
		.eq("id", id)

	if (err) {
		console.error(err)
		throw error(500, err)
	}

	return true
}

export async function updateProfileProtected(profile: Profile) {
	if (!adminLoggedIn) {
		await login(false)
		if (!adminLoggedIn) return false
	}

	console.log("Updating profile protected for user: ", profile)

	const { error: errSub } = await supabaseAdmin
		.schema("profiles")
		.from("subscriptions")
		.update({
			date_end: profile.subscriptions.date_end,
			external: profile.subscriptions.external,
			subscription_id: profile.subscriptions.subscription_id,
			date_start: profile.subscriptions.date_start,
			cancel: profile.subscriptions.cancel,
			price_id: profile.subscriptions.price_id
		})
		.eq("id", profile.id)

	if (errSub) {
		console.error(errSub)
		throw error(500, errSub)
	}

	const { error: errRoles } = await supabaseAdmin
		.schema("profiles")
		.from("roles")
		.update({
			developer: profile.roles.developer,
			premium: profile.roles.premium,
			scripter: profile.roles.scripter,
			tester: profile.roles.tester,
			timeout: profile.roles.timeout,
			banned: profile.roles.banned,
			vip: profile.roles.vip
		})
		.eq("id", profile.id)

	if (errRoles) {
		console.error(errRoles)
		throw error(500, errRoles)
	}
	return true
}

export async function updateProfileRoles(profile: Profile) {
	if (!adminLoggedIn) {
		await login(false)
		if (!adminLoggedIn) return false
	}

	console.log("Updating profile.roles for user: ", profile.id, " current roles: ", profile.roles)

	const { error: err } = await supabaseAdmin
		.schema("profiles")
		.from("roles")
		.update({
			developer: profile.roles.developer,
			premium: profile.roles.premium,
			scripter: profile.roles.scripter,
			tester: profile.roles.tester,
			timeout: profile.roles.timeout,
			banned: profile.roles.banned,
			vip: profile.roles.vip
		})
		.eq("id", profile.id)

	if (err) {
		console.error(err)
		throw error(500, err)
	}
	return true
}

export async function updateProfileSubscription(profile: Profile) {
	if (!adminLoggedIn) {
		await login(false)
		if (!adminLoggedIn) return false
	}

	console.log(
		"Updating profile subscription for user: ",
		profile.id,
		" current subscription: ",
		profile.subscriptions
	)

	const { error: err } = await supabaseAdmin
		.schema("profiles")
		.from("subscriptions")
		.update({
			date_end: profile.subscriptions.date_end,
			external: profile.subscriptions.external,
			subscription_id: profile.subscriptions.subscription_id,
			date_start: profile.subscriptions.date_start,
			cancel: profile.subscriptions.cancel,
			price_id: profile.subscriptions.price_id
		})
		.eq("id", profile.id)

	if (err) {
		console.error(err)
		throw error(500, err)
	}

	return true
}

export async function removeScriptBroken(id: string) {
	if (!adminLoggedIn) {
		await login(false)
		if (!adminLoggedIn) return false
	}

	console.log("Updating scripts.protected.broken for script: ", id)

	const { error: err } = await supabaseAdmin
		.schema("scripts")
		.from("protected")
		.update({ broken: false })
		.eq("id", id)

	if (err) {
		console.log("scripts.protected UPDATE failed: ")
		console.error(err)
		throw error(500, err.message)
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
			`Server error, this is probably not an issue on your end! - UPDATE scripts.stats_site failed
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
		.rpc("add_reporter", { script_id: script, user_id: user })

	if (err) {
		console.error(err)
		throw error(
			500,
			`Server error, this is probably not an issue on your end! - UPDATE scripts.stats_site failed
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
