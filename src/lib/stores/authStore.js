import { supabase, getServiceSupabase } from "$lib/supabase.js"
import { writable } from "svelte/store"
import { createAvatar } from "@dicebear/avatars"
import * as style from "@dicebear/avatars-bottts-sprites"

export const user = writable(false)
export const profile = writable([])

const loadProfile = async (id) => {
	const { data, error } = await supabase.from("profile").select().eq("id", id)

	if (error) return console.error(error)

	profile.set(data[0])
}

export const updateRoles = async (id, d, t, p, v) => {
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
	if (session) {
		loadProfile(session?.user.id)
	} else {
		profile.set(false)
	}
})

export const logout = () => supabase.auth.signOut()

export var getSeed = () => {
	if (!supabase.auth.currentUser) {
		return String(Math.floor(Math.random() * 100000000))
	} else {
		return supabase.auth.currentUser.id
	}
}

export var avatar

export var reloadAvatar = () => {
	avatar = createAvatar(style, {
		seed: getSeed(),
		scale: 75,
		size: 50
	})
}

export const updateUsername = async (id, username) => {
	const { error } = await supabase.from("profile").update({ username: username }).eq("id", id)

	if (error) {
		console.log(error.message)
	}
}
