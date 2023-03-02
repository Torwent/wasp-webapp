import { supabase } from "$lib/database/supabase"
import { pad } from "$lib/utils"
import type { Script, DownloadScript } from "$lib/database/types"

export async function getScripts() {
	const { data: scriptsPublic, error: errorPublic } = await supabase
		.from("scripts_public")
		.select("id, title, categories")
		.order("id", { ascending: true })
	if (errorPublic) return console.error(errorPublic)

	const { data: scriptsProtected, error: errorProtected } = await supabase
		.from("scripts_protected")
		.select("id, revision")
		.order("id", { ascending: true })
	if (errorProtected) return console.error(errorProtected)

	if (scriptsPublic.length !== scriptsProtected.length)
		return console.error("Scripts public and protected data length does not match.")

	let scripts: DownloadScript[] = []

	for (let i = 0; i < scriptsPublic.length; i++) {
		if (scriptsPublic[i].id !== scriptsProtected[i].id) {
			console.error(
				"storage getScripts() id mismatch:",
				scriptsPublic[i].id,
				" and ",
				scriptsProtected[i].id
			)
			continue
		}
		let script: DownloadScript = {
			id: scriptsPublic[i].id,
			title: scriptsPublic[i].title,
			revision: scriptsProtected[i].revision,
			categories: scriptsPublic[i].categories
		}

		scripts.push(script)
	}

	return scripts
}

export async function loadPublicFiles(bucket: string, folder: string) {
	const { data, error } = await supabase.storage.from(bucket).list(folder, {
		limit: 20,
		offset: 0,
		sortBy: { column: "name", order: "asc" }
	})

	if (error) return console.error(error)

	let imgURLs = []

	if (data === null) return

	for (let i of data) {
		const { publicURL, error } = supabase.storage.from(bucket).getPublicUrl(folder + "/" + i.name)

		if (error) {
			return console.error(error)
		}

		if (publicURL !== null) {
			imgURLs.push(publicURL.replaceAll(" ", "%20"))
		}
	}

	return imgURLs
}

async function getFilePath(bucket: string, path: string) {
	const { data, error } = await supabase.storage.from(bucket).list(path)

	if (data === null || error) return console.error(error)

	//data.sort((a, b) => (a.name > b.name ? 1 : b.name > a.name ? -1 : 0))
	return data
}

export async function getSignedURL(bucket: string, path: string, file: string) {
	path += "/" + file

	const { signedURL, error } = await supabase.storage.from(bucket).createSignedUrl(path, 10)

	if (error) return console.error(error)
	return signedURL
}

export async function uploadFile(bucket: string, path: string, file: File) {
	const { error } = await supabase.storage.from(bucket).upload(path, file)

	if (error) console.error(error)
}

export async function updateImg(bucket: string, path: string, fileName: string, file: File) {
	let paths = (await getFilePath(bucket, path)) as { name: string }[]

	paths.forEach(async (p) => {
		if (p.name === fileName.replace("/", "")) {
			const { error } = await supabase.storage.from(bucket).update(path + fileName, file)
			if (error) return console.error(error)
			return
		}
	})

	const { error } = await supabase.storage.from(bucket).upload(path + fileName, file)

	if (error) return console.error(error)
}

async function updateScriptInfo(file: File, id: string, revision: number) {
	function updateID(str: string, id: string) {
		let regex =
			/{\$UNDEF SCRIPT_ID}{\$DEFINE SCRIPT_ID := '[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}'}/

		let replaceStr = "{$UNDEF SCRIPT_ID}{$DEFINE SCRIPT_ID := '" + id + "'}"

		if (str.match(regex)) {
			str = str.replace(regex, replaceStr)
		} else {
			str = replaceStr.concat("\n").concat(str)
		}

		return str
	}

	function updateRevision(str: string, revision: number) {
		let regex = /{\$UNDEF SCRIPT_REVISION}{\$DEFINE SCRIPT_REVISION := '(\d*?)'}/

		let replaceStr =
			"{$UNDEF SCRIPT_REVISION}{$DEFINE SCRIPT_REVISION := '" + revision.toString() + "'}"

		if (str.match(regex)) {
			str = str.replace(regex, replaceStr)
		} else {
			str = replaceStr.concat("\n").concat(str)
		}

		return str
	}

	let fileString = await file.text()

	fileString = updateID(updateRevision(fileString, revision), id)

	return new File([fileString], file.name, { type: "text/plain" })
}

export async function uploadScript(
	script: Script,
	file: File | undefined,
	coverFile: File | undefined,
	bannerFile: File | undefined
) {
	if (!file) return console.error("No file added!")

	const publicData = {
		title: script.title,
		description: script.description,
		content: script.content,
		categories: script.categories,
		subcategories: script.subcategories
	}

	const { data, error } = await supabase.from("scripts_public").insert(publicData)

	if (error) return console.error(error)

	script = data[0]

	file = await updateScriptInfo(file, script.id as string, 1)

	//rename all scripts to script so we can always fetch them later regardless of name changes.
	let path = script.id + "/" + pad(1, 9) + "/script.simba"

	let promises = [uploadFile("scripts", path, file)]

	if (coverFile) promises.push(uploadFile("imgs", "scripts/" + script.id + "/cover.jpg", coverFile))

	if (bannerFile)
		promises.push(uploadFile("imgs", "scripts/" + script.id + "/banner.jpg", bannerFile))

	await Promise.all(promises)
}

export async function updateScript(
	script: Script,
	file: File | undefined,
	coverFile: File | undefined,
	bannerFile: File | undefined
) {
	if (file) script.revision += 1

	const publicData = {
		id: script.id,
		title: script.title,
		description: script.description,
		content: script.content,
		categories: script.categories,
		subcategories: script.subcategories
	}

	const { error } = await supabase
		.from("scripts_public")
		.update(publicData)
		.match({ id: publicData.id })

	if (error) return console.error(error)

	let promises = []

	if (file) {
		file = await updateScriptInfo(file, script.id as string, script.revision)
		let path = script.id + "/" + pad(script.revision, 9) + "/script.simba"

		promises.push(uploadFile("scripts", path, file))
	}

	if (coverFile) promises.push(updateImg("imgs", "scripts/" + script.id, "/cover.jpg", coverFile))

	if (bannerFile)
		promises.push(updateImg("imgs", "scripts/" + script.id, "/banner.jpg", bannerFile))

	await Promise.all(promises)
}
