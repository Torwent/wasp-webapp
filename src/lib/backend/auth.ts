import type { SupabaseClient } from "@supabase/supabase-js"
import type { RealtimeChannel, User } from "@supabase/supabase-js"

import { get, writable } from "svelte/store"
import type { Profile } from "./types"

export const supabaseStore = writable<SupabaseClient | null>(null)
export const userStore = writable<User | null>(null)
export const profileStore = writable<Profile | null>(null)

let realtimeRoles: RealtimeChannel | null = null
let realtimeWarning: RealtimeChannel | null = null

async function getUser() {
	const tmp = get(userStore)
	if (tmp) return tmp

	const supabase = get(supabaseStore)
	if (!supabase) return null

	const {
		data: { user }
	} = await supabase.auth.getUser()

	userStore.set(user)
	return user
}

export async function getUserID() {
	const user = await getUser()
	return user ? user.id : null
}

export async function disableProfile() {
	profileStore.set(null)
	if (realtimeRoles) realtimeRoles.unsubscribe()
	realtimeRoles = null

	if (realtimeWarning) realtimeWarning.unsubscribe()
	realtimeWarning = null
}

export async function getProfile(): Promise<Profile | null> {
	const tmp = get(profileStore) as Profile | null
	const id = await getUserID()
	if (tmp && tmp.id === id) return tmp

	if (!id) {
		await disableProfile()
		return null
	}

	const supabase = get(supabaseStore)
	if (!supabase) return null

	const { data, error } = await supabase
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

	profileStore.set(result)

	if (realtimeRoles) realtimeRoles.unsubscribe()
	realtimeRoles = supabase
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
				let tmp = get(profileStore) as Profile
				tmp.profiles_protected.developer = payload.new.developer
				tmp.profiles_protected.premium = payload.new.premium
				tmp.profiles_protected.vip = payload.new.vip
				tmp.profiles_protected.tester = payload.new.tester
				tmp.profiles_protected.scripter = payload.new.scripter
				tmp.profiles_protected.moderator = payload.new.moderator
				tmp.profiles_protected.administrator = payload.new.administrator
				profileStore.set(tmp)
			}
		)
		.subscribe()

	if (realtimeWarning) realtimeWarning.unsubscribe()
	realtimeWarning = supabase
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
				let tmp = get(profileStore) as Profile
				tmp.profiles_private.dismissed_warning = payload.new.dismissed_warning
				profileStore.set(tmp)
			}
		)
		.subscribe()

	return result
}
