import { supabase } from "$lib/supabase"
import { writable } from "svelte/store"

export const posts = writable([])

export const devs = writable([])

export const questions = writable([])
export const commonErrors = writable([])

export const scripts = writable([])

export const categories = writable([])
export const subcategories = writable([])

export const loadData = async (table, store) => {
	const { data, error } = await supabase.from(table).select()

	if (error) return console.error(error)

	store.set(data)
}
