import type { ProfileRoles, Scripter, StatsTotal } from "$lib/types/collection"
import { UUID_V4_REGEX, formatError } from "$lib/utils"
import type { SupabaseClient } from "@supabase/supabase-js"
import { error } from "@sveltejs/kit"

export async function getStatsTotal(supabase: SupabaseClient) {
	const { data, error: err } = await supabase.rpc("get_stats_total").single()

	if (err)
		error(
			500,
			"<p>Server error, this is probably not an issue on your end!</p>" +
				"<p>SELECT get_stats_total postgres function failed!</p>" +
				formatError(err)
		)

	return data as StatsTotal
}

export function canEdit(id: string | null, roles: ProfileRoles | null, author: string) {
	if (!id || !roles) return false
	if (roles.administrator || roles.moderator) return true
	return id === author
}

export async function getScripterSlug(supabase: SupabaseClient, slug: string) {
	const { data, error: err } = await supabase
		.schema("profiles")
		.from("scripters")
		.select(
			`id, realname, description, content, url, github, paypal_id, content, profiles (username, avatar)`
		)
		.eq("url", slug)
		.limit(1)
		.limit(1, { referencedTable: "profiles" })
		.single<Scripter>()

	if (err)
		error(
			500,
			"<p>Server error, this is probably not an issue on your end!</p>" +
				"<p>SELECT profiles.scripters failed</p>" +
				formatError(err)
		)

	return data
}

export async function getScripterUUID(supabase: SupabaseClient, uuid: string) {
	const { data, error: err } = await supabase
		.schema("profiles")
		.from("scripters")
		.select(
			`id, realname, description, content, url, github, paypal_id, content, profiles (username, avatar)`
		)
		.eq("id", uuid)
		.limit(1)
		.limit(1, { referencedTable: "profiles" })
		.single<Scripter>()

	if (err)
		error(
			500,
			"<p>Server error, this is probably not an issue on your end!</p>" +
				"<p>SELECT profiles.scripters failed</p>" +
				formatError(err)
		)
	return data
}

export async function getScripter(supabase: SupabaseClient, id: string) {
	id = id.toLowerCase()
	return UUID_V4_REGEX.test(id)
		? await getScripterUUID(supabase, id)
		: await getScripterSlug(supabase, id)
}
