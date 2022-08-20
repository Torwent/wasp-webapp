import { supabase } from "$lib/supabase"
import { writable } from "svelte/store"

export interface Post {
	title: string
	description: string
	content: string
	level: number
	author: string
}

//this is included here because it's only used to search scripts and posts
export const search = (content: string, search: string) => {
	content = content.toLowerCase()
	search = search.toLowerCase()
	let i = 0,
		n = -1,
		l: string

	for (; (l = search[i++]); ) {
		if (!~(n = content.indexOf(l, n + 1))) {
			return false
		}
	}
	return true
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
