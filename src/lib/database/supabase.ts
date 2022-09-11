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

export const getData = async (table: string, id: string = "") => {
	const { data, error } =
		id === ""
			? await supabase.from(table).select()
			: await supabase.from(table).select().eq("id", id)

	if (error) return console.error(error)

	return data
}
