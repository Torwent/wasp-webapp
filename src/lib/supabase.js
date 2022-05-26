import { createClient } from "@supabase/supabase-js"

export const supabase = createClient(
	import.meta.env.VITE_PUBLIC_SUPABASE_URL,
	import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY
)

export const getServiceSupabase = () =>
	createClient(
		import.meta.env.VITE_PUBLIC_SUPABASE_URL,
		import.meta.env.VITE_PUBLIC_SUPABASE_SERVICE_KEY
	)
