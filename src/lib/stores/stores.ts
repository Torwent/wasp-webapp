import { supabase } from "$lib/database/supabase"
import { writable } from "svelte/store"

export const scripts: Record<PropertyKey, any> = writable([])

export const categories: Record<PropertyKey, any> = writable([])
export const subcategories: Record<PropertyKey, any> = writable([])

export const loadData = async (table: string, store: Record<PropertyKey, any>) => {
	const { data, error } = await supabase.from(table).select()

	if (error) return console.error(error)

	store.set(data)
}
