import type { SupabaseClient } from "@supabase/supabase-js"
import type {
	Category,
	SubCategory,
	CheckboxType,
	EmojiTooltip,
	DeveloperWithUsername,
	IScriptCard,
	Script,
	Profile
} from "$lib/types/collection"
import { error } from "@sveltejs/kit"

export async function updateWarning(supabase: SupabaseClient) {
	const {
		data: { user }
	} = await supabase.auth.getUser()

	if (!user) return false

	const { error: err } = await supabase
		.from("profiles_private")
		.update({ dismissed_warning: true })
		.eq("id", user.id)

	if (err)
		throw error(
			500,
			`Server error, this is probably not an issure on your end! - UPDATE profiles_private failed
			Error code: ${err.code}
			Error hint: ${err.hint}
			Error details: ${err.details}
			Error hint: ${err.message}`
		)
}

export async function getCheckBoxes(categories: Category[], subcategories: SubCategory[]) {
	const result: CheckboxType[] = []
	let id = 0

	for (const category of categories) {
		result.push({
			id: id++,
			name: category.name,
			emoji: category.emoji,
			main: true,
			checked: false
		})

		for (const subcategory of subcategories) {
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

	return result
}

function getToolTips(
	categoriesStr: string[],
	subcategoriesStr: string[],
	categories: Category[],
	subcategories: SubCategory[]
) {
	const allCategories = [...categories, ...subcategories]

	const result: EmojiTooltip[] = []
	const scriptCategories = [...categoriesStr, ...subcategoriesStr]

	for (const c of scriptCategories) {
		for (const c2 of allCategories) {
			if (c === c2.name) {
				result.push({ name: c2.name, emoji: c2.emoji })
				break
			}
		}
	}

	return result
}

export function addToolTips(
	script: IScriptCard,
	categories: Category[],
	subcategories: SubCategory[]
) {
	const tooltips = getToolTips(script.categories, script.subcategories, categories, subcategories)

	script.tooltip_emojis = []
	script.tooltip_names = []

	tooltips.forEach((tooltip) => {
		script.tooltip_emojis.push(tooltip.emoji)
		script.tooltip_names.push(tooltip.name)
	})
}

export async function getScripts(supabase: SupabaseClient) {
	const { data, error: err } = await supabase
		.from("scripts_public")
		.select(
			`id, title, description, content, categories, subcategories, published, min_xp, max_xp, min_gp, max_gp,
			scripts_protected (assets_path, author_id, assets_alt, revision, profiles_public(username, avatar_url)),
			stats_scripts (experience, gold, runtime, levels, total_unique_users, total_current_users, total_monthly_users)`
		)
		.order("title", { ascending: true })
		.returns<Script[]>()
	if (err)
		throw error(
			500,
			`Server error, this is probably not an issure on your end! - SELECT scripts_public failed
			Error code: ${err.code}
			Error hint: ${err.hint}
			Error details: ${err.details}
			Error hint: ${err.message}`
		)
	return data
}

export async function getScript(supabase: SupabaseClient, slug: string) {
	const { data, error: err } = await supabase
		.from("scripts_public")
		.select(
			`id, url, title, description, content, categories, subcategories, published, min_xp, max_xp, min_gp, max_gp,
			tooltip_emojis, tooltip_names,
			scripts_protected (assets_path, author_id, assets_alt, revision, profiles_public(username, avatar_url)),
			stats_scripts (experience, gold, runtime, levels, total_unique_users, total_current_users, total_monthly_users)`
		)
		.eq("url", slug)
		.returns<Script[]>()
	if (err)
		throw error(
			500,
			`Server error, this is probably not an issure on your end! - SELECT scripts_public failed
			Error code: ${err.code}
			Error hint: ${err.hint}
			Error details: ${err.details}
			Error hint: ${err.message}`
		)

	if (data.length === 0) throw error(404, "That script doesn't exist.")
	return data[0]
}

export async function getScriptUUID(supabase: SupabaseClient, uuid: string) {
	const { data, error: err } = await supabase
		.from("scripts_public")
		.select(
			`id, url, title, description, content, categories, subcategories, published, min_xp, max_xp, min_gp, max_gp,
			tooltip_emojis, tooltip_names,
			scripts_protected (assets_path, author_id, assets_alt, revision, profiles_public(username, avatar_url)),
			stats_scripts (experience, gold, runtime, levels, total_unique_users, total_current_users, total_monthly_users)`
		)
		.eq("id", uuid)
		.returns<Script[]>()
	if (err)
		throw error(
			500,
			`Server error, this is probably not an issure on your end! - SELECT scripts_public failed
			Error code: ${err.code}
			Error hint: ${err.hint}
			Error details: ${err.details}
			Error hint: ${err.message}`
		)

	if (data.length === 0) throw error(404, "That script doesn't exist.")
	return data[0]
}

export async function getDeveloper(supabase: SupabaseClient, slug: string) {
	const { data, error: err } = await supabase
		.from("developers")
		.select(
			`id, realname, description, github, paypal_id, content, profiles_public (username, avatar_url)`
		)
		.eq("url", slug)
		.returns<DeveloperWithUsername[]>()

	if (err)
		throw error(
			500,
			`Server error, this is probably not an issure on your end! - SELECT developers failed
			Error code: ${err.code}
			Error hint: ${err.hint}
			Error details: ${err.details}
			Error hint: ${err.message}`
		)
	return data[0]
}

export async function getDeveloperUUID(supabase: SupabaseClient, uuid: string) {
	const { data, error: err } = await supabase
		.from("developers")
		.select(
			`id, realname, description, github, paypal_id, content, profiles_public (username, avatar_url)`
		)
		.eq("id", uuid)
		.returns<DeveloperWithUsername[]>()

	if (err)
		throw error(
			500,
			`Server error, this is probably not an issure on your end! - SELECT developers failed
			Error code: ${err.code}
			Error hint: ${err.hint}
			Error details: ${err.details}
			Error hint: ${err.message}`
		)
	return data[0]
}

export async function getSignedURL(
	supabase: SupabaseClient,
	bucket: string,
	path: string,
	file: string
) {
	path += "/" + file

	const { data, error: err } = await supabase.storage.from(bucket).createSignedUrl(path, 10)

	if (err)
		throw error(
			401,
			`Server error, this is probably not an issure on your end! - Get sign url for ${bucket} to ${bucket} failed!
			Error name: ${err.name}
			Error message: ${err.message}
			Error cause: ${err.cause}
			Error stack: ${err.stack}`
		)
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
