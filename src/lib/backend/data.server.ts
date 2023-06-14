import type { Script, ScriptPublic } from "./types"
import { pad } from "$lib/utils"
import type { SupabaseClient } from "@supabase/supabase-js"

function updateID(str: string, id: string) {
	const regex = /{\$UNDEF SCRIPT_ID}{\$DEFINE SCRIPT_ID := '(.*?)'}/
	const replace = "{$UNDEF SCRIPT_ID}{$DEFINE SCRIPT_ID := '" + id + "'}"
	str = str.match(regex) ? str.replace(regex, replace) : replace.concat("\n").concat(str)

	return str
}

function updateRevision(str: string, rev: number) {
	const regex = /{\$UNDEF SCRIPT_REVISION}{\$DEFINE SCRIPT_REVISION := '(.*?)'}/
	const replace = "{$UNDEF SCRIPT_REVISION}{$DEFINE SCRIPT_REVISION := '" + rev.toString() + "'}"
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
	script: ScriptPublic,
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

	const { data, error } = await supabase.from("scripts_public").insert(publicData).select()
	if (error) {
		console.error("scripts_public INSERT failed: " + error.message)
		return { error: error.message }
	}

	script.id = data[0].id

	scriptFile = await updateScriptFile(scriptFile, script.id as string, 1)

	//rename all scripts to script so we can always fetch them later regardless of name changes.
	const path = script.id + "/" + pad(1, 9) + "/script.simba"

	uploadFile(supabase, "scripts", path, scriptFile)
	uploadFile(supabase, "imgs", "scripts/" + script.id + "/cover.jpg", coverFile)
	uploadFile(supabase, "imgs", "scripts/" + script.id + "/banner.jpg", bannerFile)

	return { error: undefined }
}

export async function updateScript(
	supabase: SupabaseClient,
	script: Script,
	scriptFile: File | undefined,
	coverFile: File | undefined,
	bannerFile: File | undefined
) {
	console.log(
		"📜 Updating ",
		script.title,
		" by ",
		script.scripts_protected.author,
		" id: ",
		script.id
	)

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

	const { error } = await supabase.from("scripts_public").update(publicData).eq("id", script.id)
	if (error) {
		console.error("scripts_public UPDATE failed: " + error.message)
		return { error: error.message }
	}

	if (scriptFile) {
		const revision = script.scripts_protected.revision + 1
		console.log("Updating script revision to ", revision)
		scriptFile = await updateScriptFile(scriptFile, script.id as string, revision)
		const path = script.id + "/" + pad(revision, 9) + "/script.simba"
		uploadFile(supabase, "scripts", path, scriptFile)
	}

	if (coverFile) {
		console.log("Updating script cover")
		uploadFile(supabase, "imgs", "scripts/" + script.id + "/cover.jpg", coverFile)
	}
	if (bannerFile) {
		console.log("Updating script banner")
		uploadFile(supabase, "imgs", "scripts/" + script.id + "/banner.jpg", bannerFile)
	}

	return { error: undefined }
}

export async function getSignedURLServer(
	supabase: SupabaseClient,
	bucket: string,
	path: string,
	file: string
) {
	path += "/" + file

	const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, 10)
	if (error) {
		console.error("Signed URL for " + bucket + " to " + path + " failed: " + error.message)
		return false
	}
	return data.signedUrl
}
