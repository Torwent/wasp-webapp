import type { SupabaseClient } from "@supabase/supabase-js"
import type {
	Category,
	SubCategory,
	EmojiTooltip,
	ScripterWithUsername,
	Script,
	Profile,
	StatsSimba
} from "$lib/types/collection"
import { error } from "@sveltejs/kit"

export async function updateWarning(supabase: SupabaseClient) {
	const {
		data: { user }
	} = await supabase.auth.getUser()

	if (!user) return false

	const { error: err } = await supabase
		.schema("profiles")
		.from("private")
		.update({ warning: true })
		.eq("id", user.id)

	if (err)
		throw error(
			500,
			`Server error, this is probably not an issure on your end! - UPDATE profiles.private failed
			Error code: ${err.code}
			Error hint: ${err.hint}
			Error details: ${err.details}
			Error hint: ${err.message}`
		)
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

export function addToolTips(script: Script, categories: Category[], subcategories: SubCategory[]) {
	const tooltips = getToolTips(script.categories, script.subcategories, categories, subcategories)

	script.tooltip_emojis = []
	script.tooltip_names = []

	tooltips.forEach((tooltip) => {
		script.tooltip_emojis.push(tooltip.emoji)
		script.tooltip_names.push(tooltip.name)
	})
}

export const scriptsQueryString = `id, url, title, description, content, categories, subcategories, published, min_xp, max_xp, min_gp, max_gp,
			tooltip_emojis, tooltip_names,
			protected (assets, author_id, revision, username, avatar, revision_date)`

export async function getScripts(supabase: SupabaseClient) {
	const { data, error: err } = await supabase
		.schema("scripts")
		.from("scripts")
		.select(scriptsQueryString)
		.order("title", { ascending: true })
		.returns<Script[]>()
	if (err)
		throw error(
			500,
			`Server error, this is probably not an issure on your end! - SELECT scripts.scripts failed
			Error code: ${err.code}
			Error hint: ${err.hint}
			Error details: ${err.details}
			Error hint: ${err.message}`
		)
	return data
}

export async function getScript(supabase: SupabaseClient, slug: string) {
	const { data, error: err } = await supabase
		.schema("scripts")
		.from("scripts")
		.select(scriptsQueryString)
		.eq("url", slug)
		.returns<Script[]>()
	if (err)
		throw error(
			500,
			`Server error, this is probably not an issure on your end! - SELECT scripts.scripts failed
			Error code: ${err.code}
			Error hint: ${err.hint}
			Error details: ${err.details}
			Error hint: ${err.message}`
		)

	if (data.length === 0) throw error(404, "That script doesn't exist.")
	return data[0]
}

export async function scriptExists(supabase: SupabaseClient, slug: string) {
	const { data, error: err } = await supabase
		.schema("scripts")
		.from("scripts")
		.select("url", { head: true })
		.eq("url", slug)

	if (err)
		throw error(
			500,
			`Server error, this is probably not an issure on your end! - SELECT scripts.scripts failed
			Error code: ${err.code}
			Error hint: ${err.hint}
			Error details: ${err.details}
			Error hint: ${err.message}`
		)

	console.log("HERE: ", data)
	return data.length > 0
}

export async function getScriptUUID(supabase: SupabaseClient, uuid: string) {
	const { data, error: err } = await supabase
		.schema("scripts")
		.from("scripts")
		.select(scriptsQueryString)
		.eq("id", uuid)
		.returns<Script[]>()
	if (err)
		throw error(
			500,
			`Server error, this is probably not an issure on your end! - SELECT scripts.scripts failed
			Error code: ${err.code}
			Error hint: ${err.hint}
			Error details: ${err.details}
			Error hint: ${err.message}`
		)

	if (data.length === 0) throw error(404, "That script doesn't exist.")
	return data[0]
}

export async function getScriptsStats(supabase: SupabaseClient, script_id: string) {
	const { data, error: err } = await supabase
		.schema("scripts")
		.from("stats_simba")
		.select(
			"experience, gold, runtime, levels, unique_users, unique_users_total, online_users, online_users_total"
		)
		.eq("id", script_id)
		.limit(1)
		.returns<StatsSimba[]>()

	if (err) {
		console.error(err)
		return {
			id: "",
			experience: 0,
			gold: 0,
			runtime: 0,
			levels: 0,
			unique_users: [],
			unique_users_total: 0,
			online_users: [],
			online_users_total: 0
		}
	}

	return data[0]
}

export async function getScripter(supabase: SupabaseClient, slug: string) {
	const { data, error: err } = await supabase
		.schema("profiles")
		.from("scripters")
		.select(
			`id, realname, description, github, paypal_id, content,  profiles!left (username, avatar)`
		)
		.eq("url", slug)
		.limit(1)
		.limit(1, { foreignTable: "profiles" })
		.returns<ScripterWithUsername[]>()

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

export async function getScripterUUID(supabase: SupabaseClient, uuid: string) {
	const { data, error: err } = await supabase
		.schema("profiles")
		.from("scripters")
		.select(
			`id, realname, description, github, paypal_id, content,  profiles!left (username, avatar)`
		)
		.eq("id", uuid)
		.limit(1)
		.limit(1, { foreignTable: "profiles" })
		.returns<ScripterWithUsername[]>()

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
			501,
			`Server error, this is probably not an issure on your end! - Get sign url for ${bucket} to ${path} failed!
			Error name: ${err.name}
			Error message: ${err.message}
			Error cause: ${err.cause}
			Error stack: ${err.stack}`
		)
	return data.signedUrl
}

export function canEdit(profile: Profile | null, author: string | null | undefined) {
	if (!profile) return false

	if (profile.roles.administrator) return true
	if (profile.roles.moderator) return true

	return profile.id === author
}

export function canDownload(profile: Profile | null) {
	if (!profile) return false
	if (profile.roles.administrator) return true
	if (profile.roles.moderator) return true
	if (profile.roles.scripter) return true
	if (profile.roles.tester) return true
	if (profile.roles.vip) return true
	if (profile.roles.premium) return true
	return false
}
