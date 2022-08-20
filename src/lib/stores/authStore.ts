import { supabase, getServiceSupabase } from "$lib/supabase"
import { writable } from "svelte/store"
import { createAvatar } from "@dicebear/avatars"
import * as style from "@dicebear/avatars-bottts-sprites"

export const user: any = writable(false)
export const profile: any = writable([])

export const loadProfile = async (id: string) => {
	const { data, error } = await supabase.from("profile").select().eq("id", id)

	if (error) return console.error(error)

	profile.set(data[0])
}

export const updateRoles = async (id: string, d: boolean, t: boolean, p: boolean, v: boolean) => {
	const ssb = getServiceSupabase()
	ssb.auth.signOut()

	const { error } = await ssb
		.from("profile")
		.update({ dev: d, tester: t, premium: p, vip: v })
		.eq("id", id)

	if (error) console.log(error)

	loadProfile(id)
}

supabase.auth.onAuthStateChange((_, session) => {
	user.set(session?.user)
	if (session && session?.user) {
		loadProfile(session?.user.id)
		return
	}
	profile.set(false)
})

export const logout = () => supabase.auth.signOut()

export var getSeed = () => {
	if (!supabase.auth.currentUser) {
		return String(Math.floor(Math.random() * 100000000))
	}
	return supabase.auth.currentUser.id
}

export var avatar: string

export var reloadAvatar = () => {
	avatar = createAvatar(style, {
		seed: getSeed(),
		scale: 75,
		size: 50
	})
}

export const updateUsername = async (id: string, username: string) => {
	const { error } = await supabase.from("profile").update({ username: username }).eq("id", id)

	if (error) {
		console.log(error.message)
	}
}
