import { supabase } from "$lib/database/supabase"
import type { Category, EmojiTooltip, ScriptCard, SubCategory } from "$lib/database/types"
import type { PageLoad } from "./$types"

export const load: PageLoad = async () => {
	const { data: dataC, error: errorC } = await supabase
		.from("scripts_categories")
		.select("name, emoji")

	if (errorC)
		return {
			categories: [],
			subcategories: [],
			scripts: []
		}

	const { data: dataS, error: errorS } = await supabase
		.from("scripts_subcategories")
		.select("category, name, emoji")

	if (errorS)
		return {
			categories: [],
			subcategories: [],
			scripts: []
		}

	const allCategories = [...dataC, ...dataS]

	function loadEmojis(categories: Category[], subcategories: SubCategory[]) {
		let result: EmojiTooltip[] = []
		const scriptCategories = [...categories, ...subcategories]

		for (let c of scriptCategories) {
			for (let c2 of allCategories) {
				if (c === c2.name) result.push({ tooltip: c2.name, icon: c2.emoji })
			}
		}

		return result
	}

	async function fetchScripts() {
		let scripts: ScriptCard[] = []
		const { data: dataPublic, error: errorPublic } = await supabase
			.from("scripts_public")
			.select()
			.order("title", { ascending: true })

		if (errorPublic) {
			console.error(errorPublic)
			return scripts
		}

		const { data: dataProtected, error: errorProtected } = await supabase
			.from("scripts_protected")
			.select()

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

			let script: ScriptCard = {
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
				assets_alt: protectedD.assets_alt,
				emojiTooltip: loadEmojis(publicD.categories, publicD.subcategories)
			}

			scripts.push(script)
		})

		return scripts
	}

	return {
		categories: dataC as Category[],
		subcategories: dataS as SubCategory[],
		scripts: fetchScripts()
	}
}
