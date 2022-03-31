import { supabase } from "$lib/supabase.js"
import { writable } from "svelte/store"

export const categories = writable([])
export const subcategories = writable([])

export const loadCategories = async () => {
	const { data, error } = await supabase.from("categories").select()

	if (error) {
		return console.error(error)
	}
	categories.set(data)
}

export const loadSubcategories = async () => {
	const { data, error } = await supabase.from("subcategories").select()

	if (error) {
		return console.error(error)
	}
	subcategories.set(data)
}

loadCategories()
loadSubcategories()
