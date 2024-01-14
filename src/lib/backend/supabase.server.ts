import { createClient } from "@supabase/supabase-js"
import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from "$env/static/public"
import { ADMIN_USER, ADMIN_PASS, PRIVATE_STRIPE_KEY } from "$env/static/private"
import type { Price, Product, Profile, ProfileSubscription } from "$lib/types/collection"
import { error } from "@sveltejs/kit"
import Stripe from "stripe"
import { profileQuery } from "$lib/utils"

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
		.select(profileQuery)
		.eq("id", id)
		.limit(1)
		.limit(1, { foreignTable: "private" })
		.limit(1, { foreignTable: "roles" })
		.returns<Profile[]>()

	if (error || data.length < 1) return null
	return data[0]
}

export async function getPrivateProfile(id: string) {
	if (!adminLoggedIn) {
		await login(false)
		if (!adminLoggedIn) return false
	}

	console.log("Updating profiles.profiles for user: ", id)

	const { data, error: err } = await supabaseAdmin
		.schema("profiles")
		.from("profiles")
		.select("username, discord")
		.eq("id", id)
		.single()

	if (err) {
		console.error(err)
		return false
	}

	return data
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

export async function updateScripterAccount(id: string, account_id: string) {
	if (!adminLoggedIn) {
		await login(false)
		if (!adminLoggedIn) return false
	}

	console.log("Updating profiles.profiles for user: ", id)

	const { error: err } = await supabaseAdmin
		.schema("profiles")
		.from("scripter")
		.update({ stripe: account_id })
		.eq("id", id)

	if (err) {
		console.error(err)
		throw error(500, err)
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
			scripter: profile.roles.scripter,
			tester: profile.roles.tester,
			banned: profile.roles.banned
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

export async function updateScriptNotification(id: string) {
	if (!adminLoggedIn) {
		await login(false)
		if (!adminLoggedIn) return false
	}

	console.log("Updating scripts.stats_site.notified for script: ", id)

	const { error: err } = await supabaseAdmin
		.schema("scripts")
		.from("stats_site")
		.update({ notified: true })
		.eq("id", id)

	if (err) {
		console.log("scripts.stats_site.notified UPDATE failed: ")
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

export async function insertSubscription(subscription: ProfileSubscription) {
	if (!adminLoggedIn) {
		await login(false)
		if (!adminLoggedIn) return false
	}

	console.log("INSERT profile.subscription for user: ", subscription.id)

	const { error } = await supabaseAdmin.schema("profiles").from("subscription").insert(subscription)
	return { error }
}

export async function upsertSubscription(subscription: ProfileSubscription) {
	if (!adminLoggedIn) {
		await login(false)
		if (!adminLoggedIn) return false
	}

	console.log("UPSERT profile.subscription for user: ", subscription.id)

	const { data, error: errSub } = await supabaseAdmin
		.schema("profiles")
		.from("subscription")
		.upsert(subscription, { onConflict: "subscription" })
		.eq("subscription", subscription.subscription)
		.select()
		.single()

	if (!data) {
		console.log("UPDATE profile.subscriptions_old for user: ", subscription.id)
		const { error: errSubOld } = await supabaseAdmin
			.schema("profiles")
			.from("subscriptions_old")
			.update({
				date_end: subscription.date_end,
				date_start: subscription.date_start,
				cancel: subscription.cancel
			})
			.eq("subscription", subscription.subscription)
			.select()
			.single()

		if (errSubOld) {
			console.error("errSub: " + errSub)
			console.error("errSubOld: " + errSubOld)
			throw error(
				500,
				"errSub: " + JSON.stringify(errSub) + "errSubOld: " + JSON.stringify(errSubOld)
			)
		}
	}

	return true
}

export async function deleteSubscription(id: string) {
	if (!adminLoggedIn) {
		await login(false)
		if (!adminLoggedIn) return false
	}

	console.log("DELETE profile.subscription: ", id)

	const { error: errSubscription } = await supabaseAdmin
		.schema("profiles")
		.from("subscription")
		.delete()
		.eq("subscription", id)

	if (errSubscription) {
		console.error(errSubscription)
		throw error(500, errSubscription)
	}

	return true
}

export async function insertProduct(product: Product) {
	if (!adminLoggedIn) {
		await login(false)
		if (!adminLoggedIn) return false
	}
	console.log("INSERT scripts.products: ", product.id)
	const { error: errProducts } = await supabaseAdmin.schema("scripts").from("products").insert({
		id: product.id,
		name: product.name,
		user_id: product.user_id,
		bundle: product.bundle,
		script: product.script,
		active: true
	})

	if (errProducts) {
		console.error(errProducts)
		console.log("object: ", product)
		throw error(500, errProducts)
	}

	return true
}

export async function updateProduct(id: string, name: string) {
	if (!adminLoggedIn) {
		await login(false)
		if (!adminLoggedIn) return false
	}

	console.log("UPDATE scripts.products: ", id)

	const { error: err } = await supabaseAdmin
		.schema("scripts")
		.from("products")
		.update({
			name: name
		})
		.eq("id", id)

	if (err) {
		console.error(err)
		throw error(500, err)
	}

	return true
}

export async function deleteProduct(id: string) {
	if (!adminLoggedIn) {
		await login(false)
		if (!adminLoggedIn) return false
	}

	console.log("DELETE scripts.products: ", id)

	const { error: errProduct } = await supabaseAdmin
		.schema("scripts")
		.from("products")
		.delete()
		.eq("id", id)

	if (errProduct) {
		console.error(errProduct)
		throw error(500, errProduct)
	}

	return true
}

export async function insertPrice(price: Price) {
	if (!adminLoggedIn) {
		await login(false)
		if (!adminLoggedIn) return false
	}

	function sleep(ms: number) {
		return new Promise((resolve) => {
			setTimeout(resolve, ms)
		})
	}

	for (let attempt = 0; attempt < 3; attempt++) {
		console.log("INSERT scripts.prices: ", price.id, " attmpt: ", attempt)

		const { error: err } = await supabaseAdmin.schema("scripts").from("prices").insert(price)

		if (err) {
			console.error(err)
			console.log("object: ", price)
			if (attempt < 2) {
				await sleep(1000)
				continue
			}

			throw error(500, err)
		}
		break
	}

	return true
}

export async function updatePrice(price: Price) {
	if (!adminLoggedIn) {
		await login(false)
		if (!adminLoggedIn) return false
	}

	console.log("UPDATE scripts.prices: ", price.id)

	const { error: err } = await supabaseAdmin
		.schema("scripts")
		.from("prices")
		.update(price)
		.eq("id", price.id)

	if (err) {
		console.error(err)
		console.log("object: ", price)
		throw error(500, err)
	}

	return true
}

export async function deletePrice(id: string) {
	if (!adminLoggedIn) {
		await login(false)
		if (!adminLoggedIn) return false
	}

	console.log("DELETE scripts.prices: ", id)

	const { error: err } = await supabaseAdmin.schema("scripts").from("prices").delete().eq("id", id)

	if (err) {
		console.error(err)
		throw error(500, err)
	}

	return true
}

export const stripe = new Stripe(PRIVATE_STRIPE_KEY, { apiVersion: "2023-10-16", typescript: true })
