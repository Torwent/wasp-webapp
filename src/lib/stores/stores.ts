import { supabase } from "$lib/supabase"
import { writable } from "svelte/store"

export interface Post {
	title: string
	description: string
	content: string
	level: number
	author: string
}

export const posts: any = writable([])

export const devs: any = writable([])

export const questions: any = writable([])
export const commonErrors: any = writable([])

export const scripts: any = writable([])

export const categories: any = writable([])
export const subcategories: any = writable([])

export const loadData = async (table: string, store: any) => {
	const { data, error } = await supabase.from(table).select()

	if (error) return console.error(error)

	store.set(data)
}
