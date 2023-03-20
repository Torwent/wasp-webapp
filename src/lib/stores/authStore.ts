import { supabase } from "$lib/database/supabase"
import { get, writable } from "svelte/store"
import type { Profile } from "$lib/database/types"
import { createAvatar } from "@dicebear/avatars"
import * as style from "@dicebear/avatars-bottts-sprites"

export const user: any = writable(false)
export const profile: any = writable(false)
export const avatar: any = writable(false)

user.set(supabase.auth.user())

export async function updateProfile() {
	if (get(user)) {
		const tmpUser = get(user) as any
		const tmpProfile = get(profile) as any
		if (tmpUser.id === tmpProfile.id) return profile
	}

	profile.set(false)
	const userID = supabase.auth.user()?.id
	if (userID == null) return

	const promises = []
	promises.push(supabase.from("profiles_public").select().eq("id", userID))
	promises.push(supabase.from("profiles_protected").select().eq("id", userID))
	promises.push(supabase.from("profiles_private").select().eq("id", userID))

	const results = await Promise.all(promises)

	const { data: profilePublic, error: errorPublic } = results[0]
	const { data: profileProtected, error: errorProtected } = results[1]
	const { data: profilePrivate, error: errorPrivate } = results[2]

	if (errorPublic) return console.error(errorPublic)
	if (errorProtected) return console.error(errorProtected)
	if (profileProtected.length === 0)
		return console.error("Can't read protected data from that profile.")
	if (errorPrivate) return console.error(errorPrivate)
	if (profilePrivate.length === 0) return console.log("Can't read private data from that profile.")

	const data: Profile = {
		id: profilePublic[0].id,
		username: profilePublic[0].username,
		discord_id: profilePublic[0].discord_id,
		avatar_url: profilePublic[0].avatar_url,
		developer: profileProtected[0].developer,
		premium: profileProtected[0].premium,
		vip: profileProtected[0].vip,
		tester: profileProtected[0].tester,
		moderator: profileProtected[0].moderator,
		administrator: profileProtected[0].administrator,
		unlocked_ips: profileProtected[0].unlocked_ips,
		dismissed_warning: profilePrivate[0].dismissed_warning
	}

	profile.set(data)
}

export async function updateAvatar() {
	avatar.set(false)
	const newAvatar = createAvatar(style, {
		seed: get(user) ? supabase.auth.user()?.id : String(Math.floor(Math.random() * 100000000)),
		scale: 75,
		size: 50
	})
	return avatar.set(newAvatar)
}

export function logout() {
	return supabase.auth.signOut()
}

export async function updateUsername(id: string, username: string) {
	const { error } = await supabase.from("profile").update({ username: username }).eq("id", id)
	if (error) console.error(error)
	updateAvatar()
}

supabase.auth.onAuthStateChange((_: any, session: any) => {
	user.set(session?.user)
	updateProfile()
	updateAvatar()
})
