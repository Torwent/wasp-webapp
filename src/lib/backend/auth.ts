import { createClient } from "@supabase/auth-helpers-sveltekit"
import { createClient as createSBClient } from "@supabase/supabase-js"
import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from "$env/static/public"
import type { RealtimeChannel, User } from "@supabase/supabase-js"

import { get, writable } from "svelte/store"
import type { Profile } from "./types"

export const user: any = writable(null)
export const profile: any = writable(null)

let realtimeRoles: RealtimeChannel | null = null
let realtimeWarning: RealtimeChannel | null = null

export const sbClient = createSBClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
	auth: {
		autoRefreshToken: true
	}
})

export const supabaseClient = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY)

async function getUser() {
	const tmp = get(user) as User | null
	return tmp
}

export async function getUserID() {
	const user = await getUser()
	return user ? user.id : null
}

export async function disableProfile() {
	profile.set(null)
	if (realtimeRoles) realtimeRoles.unsubscribe()
	realtimeRoles = null

	if (realtimeWarning) realtimeWarning.unsubscribe()
	realtimeWarning = null
}

export async function getProfile(): Promise<Profile | null> {
	const tmp = get(profile) as Profile | null
	const id = await getUserID()
	if (tmp && tmp.id === id) return tmp

	if (!id) {
		await disableProfile()
		return null
	}

	const { data, error } = await supabaseClient
		.from("profiles_public")
		.select(
			`id, discord_id, username, avatar_url,
      		profiles_protected (developer, premium, vip, tester, scripter, moderator, administrator),
			profiles_private (dismissed_warning)`
		)
		.eq("id", id)

	if (error) {
		console.error(error)
		await disableProfile()
		return null
	}

	const result = data[0] as unknown as Profile

	profile.set(result)

	if (realtimeRoles) realtimeRoles.unsubscribe()
	realtimeRoles = supabaseClient
		.channel("any")
		.on(
			"postgres_changes",
			{
				event: "UPDATE",
				schema: "public",
				table: "profiles_protected",
				filter: `id=eq.${id}`
			},
			(payload: any) => {
				let tmp = get(profile) as Profile
				tmp.profiles_protected.developer = payload.new.developer
				tmp.profiles_protected.premium = payload.new.premium
				tmp.profiles_protected.vip = payload.new.vip
				tmp.profiles_protected.tester = payload.new.tester
				tmp.profiles_protected.scripter = payload.new.scripter
				tmp.profiles_protected.moderator = payload.new.moderator
				tmp.profiles_protected.administrator = payload.new.administrator
				profile.set(tmp)
			}
		)
		.subscribe()

	if (realtimeWarning) realtimeWarning.unsubscribe()
	realtimeWarning = supabaseClient
		.channel("any")
		.on(
			"postgres_changes",
			{
				event: "UPDATE",
				schema: "public",
				table: "profiles_private",
				filter: `id=eq.${id}`
			},
			(payload: any) => {
				let tmp = get(profile) as Profile
				tmp.profiles_private.dismissed_warning = payload.new.dismissed_warning
				profile.set(tmp)
			}
		)
		.subscribe()

	return result
}
