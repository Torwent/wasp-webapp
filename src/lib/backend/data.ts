import { get, writable } from "svelte/store"
import { encodeSEO } from "$lib/utils"
import type { SupabaseClient } from "@supabase/supabase-js"
import type {
	Category,
	SubCategory,
	EmojiTooltip,
	Script,
	Post,
	Developer,
	IScriptCard,
	CheckboxType
} from "./types"
import { getProfile, getUserID, profile, supabaseStore } from "./auth"

const categories: any = writable(false)
const subCategories: any = writable(false)
const checkboxes: any = writable(false)

export async function updateUsername(id: string, username: string) {
	const supabase = get(supabaseStore) as SupabaseClient
	await supabase.from("profile").update({ username: username }).eq("id", id)
}

export async function updateWarning() {
	const supabase = get(supabaseStore) as SupabaseClient
	const id = await getUserID()
	if (!id) return false

	const { error } = await supabase
		.from("profiles_private")
		.update({ dismissed_warning: true })
		.eq("id", id)

	if (error) {
		console.error(error)
		return false
	}
	profile.set(false)
}

export async function getCategories() {
	const tmp = get(categories)
	if (tmp) return tmp as Category[]
	const supabase = get(supabaseStore) as SupabaseClient
	if (!supabase) return false
	const { data: cats } = await supabase.from("scripts_categories").select("name, emoji")

	const result: Category[] | false = cats != null ? cats : false
	categories.set(result)
	return result
}

export async function getSubCategories() {
	const tmp = get(subCategories)
	if (tmp) return tmp as SubCategory[]
	const supabase = get(supabaseStore) as SupabaseClient
	if (!supabase) return false
	const { data: cats } = await supabase
		.from("scripts_subcategories")
		.select("category, name, emoji")

	const result: SubCategory[] | false = cats != null ? cats : false
	subCategories.set(result)
	return result
}

export async function getCheckBoxes() {
	const tmp = get(checkboxes)
	if (tmp) return tmp as CheckboxType[]

	let result: CheckboxType[] = []
	const promises = await Promise.all([getCategories(), getSubCategories()])
	const categories = promises[0]
	const subcategories = promises[1]

	if (!categories || !subcategories) return false

	let id = 0

	for (let category of categories) {
		result.push({
			id: id++,
			name: category.name,
			emoji: category.emoji,
			main: true,
			checked: false
		})

		for (let subcategory of subcategories) {
			if (category.name === subcategory.category) {
				result.push({
					id: id++,
					name: subcategory.name,
					emoji: subcategory.emoji,
					main: false,
					checked: false
				})
			}
		}
	}

	checkboxes.set(result)
	return result
}

async function getAllCategories() {
	const promises = await Promise.all([getCategories(), getSubCategories()])
	const c = promises[0]
	const sc = promises[1]

	if (!c || !sc) return false
	return [...c, ...sc]
}

async function getToolTips(categories: string[], subcategories: string[]) {
	const allCategories = await getAllCategories()
	if (!allCategories) return []

	let result: EmojiTooltip[] = []
	const scriptCategories = [...categories, ...subcategories]

	for (let c of scriptCategories) {
		for (let c2 of allCategories) {
			if (c === c2.name) {
				result.push({ tooltip: c2.name, icon: c2.emoji })
				break
			}
		}
	}

	return result
}

export async function addToolTips(script: IScriptCard) {
	script.emojiTooltips = await getToolTips(script.categories, script.subcategories)
}

export async function getScripts(): Promise<Script[] | null> {
	const supabase = get(supabaseStore) as SupabaseClient
	if (!supabase) return null

	const { data, error } = await supabase
		.from("scripts_public")
		.select(
			`id, title, description, content, categories, subcategories, published, min_xp, max_xp, min_gp, max_gp,
      				scripts_protected (author, assets_path, author_id, assets_alt, revision),
	  				stats_scripts (experience, gold, runtime, levels, total_unique_users, total_current_users, total_monthly_users)`
		)
		.order("title", { ascending: true })

	if (error) {
		console.error(error)
		return null
	}

	let scriptsData = data as Script[]

	await new Promise<void>((resolve) => {
		scriptsData.forEach(async (script, index, array) => {
			await addToolTips(script)
			if (index === array.length - 1) resolve()
		})
	})

	return scriptsData
}

export async function getScript(path: string) {
	const scripts = await getScripts()
	if (!scripts) return null

	for (let i = 0; i < scripts.length; i++) {
		if (path === encodeSEO(scripts[i].title + " by " + scripts[i].scripts_protected.author))
			return scripts[i]
	}
	return null
}

export async function getScriptUUID(uuid: string | undefined) {
	if (!uuid) return null
	const scripts = await getScripts()
	if (!scripts) return null
	for (let i = 0; i < scripts.length; i++) if (uuid === scripts[i].id) return scripts[i]
	return null
}

export async function getPosts(): Promise<Post[] | null> {
	const supabase = get(supabaseStore) as SupabaseClient
	const { data, error } = await supabase
		.from("tutorials")
		.select("id, created_at, user_id, author, title, description, content, level")
		.order("title", { ascending: true })

	if (error) console.error(error)

	return data
}

export async function getPost(path: string): Promise<Post | null> {
	const posts = await getPosts()
	if (!posts) return null

	for (let i = 0; i < posts.length; i++) {
		if (path === encodeSEO(posts[i].title + " by " + posts[i].author)) return posts[i]
	}
	return null
}

export async function getDevelopers(): Promise<Developer[] | null> {
	const supabase = get(supabaseStore) as SupabaseClient
	const { data, error } = await supabase
		.from("devs")
		.select("id, realname, username, description, github, paypal_id, content")
		.order("username", { ascending: true })

	if (error) console.error(error)
	return data
}

export async function getDeveloper(path: string): Promise<Developer | null> {
	const developers = await getDevelopers()
	if (!developers) return null

	for (let i = 0; i < developers.length; i++) {
		if (path === encodeSEO(developers[i].username)) return developers[i]
	}
	return null
}

export async function getSignedURL(bucket: string, path: string, file: string) {
	path += "/" + file
	const supabase = get(supabaseStore) as SupabaseClient
	const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, 10)

	if (error) {
		console.error(error)
		return false
	}
	return data.signedUrl
}

export async function canEdit(author: string) {
	const tmp = await getProfile()
	if (!tmp) return false

	if (tmp.profiles_protected.moderator) return true
	if (tmp.profiles_protected.administrator) return true

	return tmp.id === author
}
