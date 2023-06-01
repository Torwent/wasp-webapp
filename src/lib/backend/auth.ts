import type { RealtimeChannel, SupabaseClient, User } from "@supabase/supabase-js"

import { get, writable } from "svelte/store"
import type { Profile } from "./types"

export const supabaseStore: any = writable(null)
export const user: any = writable(null)
export const profile: any = writable(null)
let realtimeProfile: RealtimeChannel | null = null

async function getUser() {
	const tmp = get(user) as User | false
	return tmp
}

export async function getUserID() {
	const user = await getUser()
	return user ? user.id : false
}

export async function disableProfile() {
	profile.set(false)
	if (realtimeProfile) realtimeProfile.unsubscribe()
	realtimeProfile = null
}

export async function getProfile(): Promise<Profile | null> {
	const tmp = get(profile) as Profile | null
	const id = await getUserID()
	if (tmp && tmp.id === id) return tmp

	const supabase = get(supabaseStore) as SupabaseClient

	if (!id) {
		await disableProfile()
		return null
	}

	const { data, error } = await supabase
		.from("profiles_public")
		.select(
			`id, discord_id, username, avatar_url,
      		profiles_protected (developer, premium, vip, tester, moderator, administrator),
			profiles_private (dismissed_warning)`
		)
		.eq("id", id)

	if (error) {
		console.error(error)
		await disableProfile()
		return null
	}

	const result = data[0] as Profile

	profile.set(result)

	if (realtimeProfile) realtimeProfile.unsubscribe()
	realtimeProfile = realtimeProfile = supabase
		.channel("any")
		.on(
			"postgres_changes",
			{
				event: "UPDATE",
				schema: "public",
				table: "profiles_protected",
				filter: `id=eq.${id}`
			},
			(payload) => {
				let tmp = get(profile) as Profile
				tmp.profiles_protected.developer = payload.new.developer
				tmp.profiles_protected.premium = payload.new.premium
				tmp.profiles_protected.vip = payload.new.vip
				tmp.profiles_protected.tester = payload.new.tester
				tmp.profiles_protected.moderator = payload.new.moderator
				tmp.profiles_protected.administrator = payload.new.administrator
				profile.set(tmp)
			}
		)
		.subscribe()

	return result
}
