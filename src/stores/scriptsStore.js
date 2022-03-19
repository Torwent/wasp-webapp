import { supabase } from "../lib/supabase.js"
import { writable } from "svelte/store"

export const scripts = writable([])

export const loadScripts = async () => {
	const { data, error } = await supabase.from("script_posts").select()

	if (error) {
		return console.error(error)
	}

	scripts.set(data)
}
loadScripts()
