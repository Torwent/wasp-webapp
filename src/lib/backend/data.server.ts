import type { Profile, Script, ScriptBase } from "$lib/types/collection"
import { pad } from "$lib/utils"
import type { Provider, SupabaseClient } from "@supabase/supabase-js"
import { error, redirect } from "@sveltejs/kit"

export async function doLogin(
	supabase: SupabaseClient,
	origin: string,
	searchParams: URLSearchParams
) {
	const provider = searchParams.get("provider") as Provider

	if (provider) {
		const { data, error: err } = await supabase.auth.signInWithOAuth({
			provider: provider,
			options: {
				redirectTo: origin + "/api/auth/callback/",
				scopes: "identify email guilds guilds.members.read"
			}
		})

		if (err) {
			console.error("Login failed: " + err.message)
			throw error(400, { message: "Something went wrong logging you in!" })
		}

		throw redirect(303, data.url)
	}

	throw error(403, "Failed to login! Provider not specified!")
}

function updateID(str: string, id: string) {
	const regex = /{\$DEFINE SCRIPT_ID := '(.*?)'}/
	const replace = "{$DEFINE SCRIPT_ID := '" + id + "'}"
	str = str.match(regex) ? str.replace(regex, replace) : replace.concat("\n").concat(str)

	return str
}

function updateRevision(str: string, rev: number) {
	const regex = /{\$DEFINE SCRIPT_REVISION := '(.*?)'}/
	const replace = "{$DEFINE SCRIPT_REVISION := '" + rev.toString() + "'}"
	str = str.match(regex) ? str.replace(regex, replace) : replace.concat("\n").concat(str)

	return str
}

async function updateScriptFile(file: File, id: string, revision: number) {
	let fileString = await file.text()
	fileString = updateID(updateRevision(fileString, revision), id)

	return new File([fileString], file.name, { type: "text/plain" })
}

async function uploadFile(supabase: SupabaseClient, bucket: string, path: string, file: File) {
	const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true })
	if (error) console.error("storage " + bucket + " UPLOAD " + path + " failed: " + error.message)
}

export async function uploadScript(
	supabase: SupabaseClient,
	script: ScriptBase,
	scriptFile: File | undefined,
	coverFile: File | undefined,
	bannerFile: File | undefined
) {
	console.log("📜 Uploading ", script.title)
	if (!scriptFile) {
		console.error("Script file is missing!")
		return { error: "Script file is missing!" }
	}

	if (!coverFile) {
		console.error("Cover image is missing!")
		return { error: "Cover image is missing!" }
	}

	if (!bannerFile) {
		console.error("Banner image is missing!")
		return { error: "Banner image is missing!" }
	}

	const publicData = {
		title: script.title,
		description: script.description,
		content: script.content,
		categories: script.categories,
		subcategories: script.subcategories,
		min_xp: script.min_xp,
		max_xp: script.max_xp,
		min_gp: script.min_gp,
		max_gp: script.max_gp
	}

	const { data, error } = await supabase
		.schema("scripts")
		.from("scripts")
		.insert(publicData)
		.select("id, url")
		.returns<ScriptBase[]>()

	if (error) {
		console.log("scripts.public INSERT failed: ")
		console.error(error)
		return { error: error.message }
	}

	script.id = data[0].id

	scriptFile = await updateScriptFile(scriptFile, script.id as string, 1)

	//rename all scripts to script so we can always fetch them later regardless of name changes.
	const path = script.id + "/" + pad(1, 9) + "/script.simba"

	await Promise.all([
		uploadFile(supabase, "scripts", path, scriptFile),
		uploadFile(supabase, "imgs", "scripts/" + script.id + "/cover.jpg", coverFile),
		uploadFile(supabase, "imgs", "scripts/" + script.id + "/banner.jpg", bannerFile)
	])

	return { url: data[0].url, error: undefined }
}

export async function updateScript(
	supabase: SupabaseClient,
	script: Script,
	scriptFile: File | undefined,
	coverFile: File | undefined,
	bannerFile: File | undefined
) {
	console.log("📜 Updating ", script.title, " by ", script.protected.username, " id: ", script.id)

	const publicData = {
		title: script.title,
		description: script.description,
		content: script.content,
		categories: script.categories,
		subcategories: script.subcategories,
		min_xp: script.min_xp,
		max_xp: script.max_xp,
		min_gp: script.min_gp,
		max_gp: script.max_gp,
		published: script.published
	}

	const { error } = await supabase
		.schema("scripts")
		.from("scripts")
		.update(publicData)
		.eq("id", script.id)

	if (error) {
		console.log("scripts.public UPDATE failed: ")
		console.error(error)
		return { error: error.message }
	}

	const promises = []

	if (scriptFile) {
		const revision = script.protected.revision + 1
		console.log("Updating script revision to ", revision)
		scriptFile = await updateScriptFile(scriptFile, script.id as string, revision)
		const path = script.id + "/" + pad(revision, 9) + "/script.simba"
		promises.push(uploadFile(supabase, "scripts", path, scriptFile))
	}

	if (coverFile) {
		console.log("Updating script cover")
		promises.push(uploadFile(supabase, "imgs", "scripts/" + script.id + "/cover.jpg", coverFile))
	}
	if (bannerFile) {
		console.log("Updating script banner")
		promises.push(uploadFile(supabase, "imgs", "scripts/" + script.id + "/banner.jpg", bannerFile))
	}

	if (promises.length > 0) await Promise.all(promises)

	return { error: undefined }
}

export async function getSignedURLServer(
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
			`Server error, this is probably not an issue on your end! - Get sign url for ${bucket} to ${bucket} failed!
			Error name: ${err.name}
			Error message: ${err.message}
			Error cause: ${err.cause}
			Error stack: ${err.stack}`
		)
	return data.signedUrl
}

export async function getProfile(supabase: SupabaseClient, id: string) {
	const { data, error } = await supabase
		.schema("profiles")
		.from("profiles")
		.select(
			`id, discord, username, avatar, private!left (email, warning),
				roles!left (banned, timeout, developer, premium, vip, tester, scripter, moderator, administrator),
				subscriptions!left (customer_id, external, subscription_id, cancel, price_id, date_start, date_end)`
		)
		.eq("id", id)
		.limit(1)
		.limit(1, { foreignTable: "private" })
		.limit(1, { foreignTable: "roles" })
		.limit(1, { foreignTable: "subscriptions" })
		.returns<Profile[]>()
	if (error || data.length < 1) return null
	return data[0]
}
