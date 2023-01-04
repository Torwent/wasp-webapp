import { supabase } from "$lib/database/supabase"
import type { Category, Script, SubCategory } from "$lib/database/types"
import type { PageLoad } from "./$types"

export const load: PageLoad = async () => {
	async function fetchCategories() {
		const { data, error } = await supabase.from("scripts_categories").select("name, emoji")

		if (error) return []
		return data as Category[]
	}

	async function fetchSubCategories() {
		const { data, error } = await supabase
			.from("scripts_subcategories")
			.select("category, name, emoji")

		if (error) return []
		return data as SubCategory[]
	}

	async function fetchScripts(id: string = "") {
		let scripts: Script[] = []
		const { data: dataPublic, error: errorPublic } =
			id === ""
				? await supabase.from("scripts_public").select().order("title", { ascending: true })
				: await supabase.from("scripts_public").select().eq("id", id)

		if (errorPublic) {
			console.error(errorPublic)
			return scripts
		}

		const { data: dataProtected, error: errorProtected } =
			id === ""
				? await supabase.from("scripts_protected").select()
				: await supabase.from("scripts_protected").select().eq("id", id)

		if (errorProtected) {
			console.error(errorProtected)
			return scripts
		}

		if (dataPublic.length !== dataProtected.length) {
			console.error("Public and Protected scripts data length do not match.")
			return scripts
		}

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
				assets_path:
					"https://enqlpchobniylwpsjcqc.supabase.co/storage/v1/object/public/imgs/scripts/" +
					publicD.id +
					"/cover.jpg",
				assets_alt: protectedD.assets_alt
			}

			scripts.push(script)
		})

		return scripts
	}

	return {
		categories: fetchCategories(),
		subcategories: fetchSubCategories(),
		scripts: fetchScripts()
	}
}
