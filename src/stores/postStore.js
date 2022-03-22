import { supabase } from "../lib/supabase.js"
import { writable } from "svelte/store"

export const posts = writable([])

export const loadPosts = async () => {
	const { data, error } = await supabase.from("posts").select()

	if (error) {
		return console.error(error)
	}

	posts.set(data)
}
loadPosts()
