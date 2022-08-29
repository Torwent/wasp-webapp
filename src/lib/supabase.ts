import { createClient } from "@supabase/supabase-js"

const options = {
	autoRefreshToken: true,
	persistSession: true
}

export const supabase = createClient(
	import.meta.env.VITE_PUBLIC_SUPABASE_URL,
	import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY,
	options
)

export const getServiceSupabase = () =>
	createClient(
		import.meta.env.VITE_PUBLIC_SUPABASE_URL,
		import.meta.env.VITE_PUBLIC_SUPABASE_SERVICE_KEY
	)

export interface Script {
	id?: string
	title: string
	description: string
	content: string
	revision: number
	categories: string[]
	subcategories: string[]
	author?: string
	user_id?: string
	assets_path?: string
	assets_alt?: string
}

export interface Post {
	user_id?: string
	title: string
	description: string
	content: string
	level: number
	author: string
}

export interface Category {
	name: string
	emoji: string
}

export interface SubCategory {
	category: string
	name: string
	emoji: string
}

export const getData = async (table: string, id: string = "") => {
	const { data, error } =
		id === ""
			? await supabase.from(table).select()
			: await supabase.from(table).select().eq("id", id)

	if (error) return console.error(error)

	return data
}
