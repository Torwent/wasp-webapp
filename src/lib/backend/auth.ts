import type { RealtimeChannel, Session, SupabaseClient, User } from "@supabase/supabase-js"

import { get, writable } from "svelte/store"
import type { Profile } from "./types"

export const supabaseStore: any = writable(false)
export const session: any = writable(false)
export const user: any = writable(false)
export const profile: any = writable(false)
let realtimeProfile: RealtimeChannel | false = false

export async function getSession() {
	const tmp = get(session) as Session | false
	return tmp
}

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
	realtimeProfile = false
}

export async function getProfile(): Promise<Profile | false> {
	const tmp = get(profile)
	if (tmp) return tmp as Profile
	const supabase = get(supabaseStore) as SupabaseClient
	const id = await getUserID()

	if (!id) {
		await disableProfile()
		return false
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
		return false
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
