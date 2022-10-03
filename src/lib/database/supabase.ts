import { createClient } from "@supabase/supabase-js"
import type { Script } from "$lib/database/types"

const options = {
	autoRefreshToken: true,
	persistSession: true
}

export const supabase = createClient(
	import.meta.env.VITE_SB_URL,
	import.meta.env.VITE_SB_ANON_KEY,
	options
)

export const getServiceSupabase = () =>
	createClient(import.meta.env.VITE_SB_URL, import.meta.env.SB_SERVICE_KEY)

export const getData = async (table: string, id: string = "") => {
	const { data, error } =
		id === ""
			? await supabase.from(table).select()
			: await supabase.from(table).select().eq("id", id)

	if (error) return console.error(error)
	return data
}

export const getScripts = async (id: string = "") => {
	const { data: dataPublic, error: errorPublic } =
		id === ""
			? await supabase.from("scripts_public").select()
			: await supabase.from("scripts_public").select().eq("id", id)

	if (errorPublic) return console.error(errorPublic)

	const { data: dataProtected, error: errorProtected } =
		id === ""
			? await supabase.from("scripts_protected").select()
			: await supabase.from("scripts_protected").select().eq("id", id)

	if (errorProtected) return console.error(errorProtected)
	if (dataPublic.length !== dataProtected.length)
		return console.error("Public and Protected scripts data length do not match.")

	let scripts: Script[] = []

	dataPublic.forEach((publicD) => {
		const protectedD = dataProtected.find((entry) => entry.id === publicD.id)

		let script: Script = {
			id: publicD.id,
			title: publicD.title,
			description: publicD.description,
			content: publicD.content,
			categories: publicD.categories,
			subcategories: publicD.subcategories,
			revision: protectedD.revision,
			author: protectedD.author,
			author_id: protectedD.author_id,
			assets_path: protectedD.assets_path,
			assets_alt: protectedD.assets_alt
		}

		scripts.push(script)
	})

	return scripts
}
