import { supabase } from "../lib/supabase.js"
import { writable } from "svelte/store"
import { createAvatar } from "@dicebear/avatars"
import * as style from "@dicebear/avatars-bottts-sprites"

export const user = writable(false)
export const profile = writable([])

const loadProfile = async () => {
	const { data, error } = await supabase.from("profile").select()

	if (error) return console.error(error)

	profile.set(data[0])
}

supabase.auth.onAuthStateChange((_, session) => {
	user.set(session?.user)
	if (session) {
		loadProfile()
	} else {
		profile.set(false)
	}
})

export const logout = () => supabase.auth.signOut()

export const updateProfileAvatar = async (id, avatar) => {
	const { error } = await supabase.from("profile").update({ avatar: avatar }).match({ id })

	if (error) {
		return console.error(error)
	}

	profile.update((profile) => {
		let index = -1
		for (let i = 0; i < profile.length; i++) {
			if (profile[i].id === id) {
				index = i
				break
			}
		}

		if (index !== -1) {
			profile[index].avatar = avatar
		}

		return profile
	})
}

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
