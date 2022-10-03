import { supabase } from "$lib/database/supabase"
import { writable } from "svelte/store"
import type { Profile } from "$lib/database/types"
import { createAvatar } from "@dicebear/avatars"
import * as style from "@dicebear/avatars-bottts-sprites"

export const user: any = writable(false)
export const profile: any = writable([])

export const getProfile = async () => {
	if (supabase.auth.user()?.id == null) return

	const { data: profilePublic, error: errorPublic } = await supabase
		.from("profiles_public")
		.select()
		.eq("id", supabase.auth.user()?.id)

	if (errorPublic) return console.error(errorPublic)

	const { data: profileProtected, error: errorProtected } = await supabase
		.from("profiles_protected")
		.select()
		.eq("id", supabase.auth.user()?.id)

	if (errorProtected) return console.error(errorProtected)
	if (profileProtected.length === 0)
		return console.log("Can't read protected data from that profile.")

	const { data: profilePrivate, error: errorPrivate } = await supabase
		.from("profiles_private")
		.select()
		.eq("id", supabase.auth.user()?.id)

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
	return data
}

supabase.auth.onAuthStateChange((_: any, session: any) => {
	user.set(session?.user)
	profile.set([])
	getProfile()
})

export const logout = () => supabase.auth.signOut()

export var getSeed = () => {
	if (!supabase.auth.user()) return String(Math.floor(Math.random() * 100000000))

	return supabase.auth.user()?.id
}

export let avatar: string

export var reloadAvatar = () => {
	avatar = createAvatar(style, {
		seed: getSeed(),
		scale: 75,
		size: 50
	})
}

export const updateUsername = async (id: string, username: string) => {
	const { error } = await supabase.from("profile").update({ username: username }).eq("id", id)

	if (error) console.error(error)
}
