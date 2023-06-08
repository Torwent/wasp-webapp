import { get, writable } from "svelte/store"
import { encodeSEO } from "$lib/utils"
import type {
	Category,
	SubCategory,
	EmojiTooltip,
	Script,
	Post,
	Developer,
	IScriptCard,
	CheckboxType,
	Profile
} from "./types"
import { getUserID, profileStore, sbClient, supabaseClient } from "./auth"

const categories = writable<Category[] | null>(null)
const subCategories = writable<SubCategory[] | null>(null)
const checkboxes = writable<CheckboxType[] | null>(null)

export async function updateUsername(id: string, username: string) {
	await supabaseClient.from("profile").update({ username: username }).eq("id", id)
}

export async function updateWarning() {
	const id = await getUserID()
	if (!id) return false

	const { error } = await supabaseClient
		.from("profiles_private")
		.update({ dismissed_warning: true })
		.eq("id", id)

	if (error) {
		console.error(error)
		return false
	}
	profileStore.set(null)
}

export async function getCategories() {
	const tmp = get(categories)
	if (tmp) return tmp as Category[]

	const { data: cats } = await supabaseClient.from("scripts_categories").select("name, emoji")

	const result: Category[] | null = cats != null ? cats : null
	categories.set(result)
	return result
}

export async function getSubCategories() {
	const tmp = get(subCategories)
	if (tmp) return tmp as SubCategory[]

	const { data: cats } = await supabaseClient
		.from("scripts_subcategories")
		.select("category, name, emoji")

	const result: SubCategory[] | null = cats != null ? cats : null
	subCategories.set(result)
	return result
}

export async function getCheckBoxes() {
	const tmp = get(checkboxes)
	if (tmp) return tmp as CheckboxType[]

	let result: CheckboxType[] | null = null
	const promises = await Promise.all([getCategories(), getSubCategories()])
	const categories = promises[0]
	const subcategories = promises[1]

	if (!categories || !subcategories) return null

	result = []
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

	if (!c || !sc) return null
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
	const { data, error } = await supabaseClient
		.from("scripts_public")
		.select(
			`id, title, description, content, categories, subcategories, published, min_xp, max_xp, min_gp, max_gp,
      				scripts_protected(author, assets_path, author_id, assets_alt, revision),
	  				stats_scripts (experience, gold, runtime, levels, total_unique_users, total_current_users, total_monthly_users)`
		)
		.order("title", { ascending: true })

	if (error) {
		console.error(error)
		return null
	}

	let scriptsData = data as unknown as Script[]

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
	const { data, error } = await supabaseClient
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
	const { data, error } = await supabaseClient
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

	const { data, error } = await sbClient.storage.from(bucket).createSignedUrl(path, 10)
	if (error) {
		console.error("Failed to get signed URL. Error message: " + error)
		return false
	}
	return data.signedUrl
}

export function canEdit(profile: Profile | null, author: string | null | undefined) {
	if (!profile) return false

	if (profile.profiles_protected.administrator) return true
	if (profile.profiles_protected.moderator) return true

	return profile.id === author
}

export function canDownload(profile: Profile | null) {
	if (!profile) return false
	if (profile.profiles_protected.administrator) return true
	if (profile.profiles_protected.moderator) return true
	if (profile.profiles_protected.scripter) return true
	if (profile.profiles_protected.tester) return true
	if (profile.profiles_protected.vip) return true
	if (profile.profiles_protected.premium) return true
	return false
}
