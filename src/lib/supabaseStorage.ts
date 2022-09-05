import { supabase, type Script } from "$lib/supabase"
import { pad } from "./utils"

export const getScripts = async () => {
	const { data, error } = await supabase.from("scripts").select()

	if (error) return console.error(error)

	return data as Script[]
}

export const loadPublicFiles = async (bucket: string, folder: string) => {
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

const getFilePath = async (bucket: string, path: string) => {
	const { data, error } = await supabase.storage.from(bucket).list(path)

	if (data === null || error) return console.error(error)

	//data.sort((a, b) => (a.name > b.name ? 1 : b.name > a.name ? -1 : 0))
	return data
}

export const getSignedURL = async (bucket: string, path: string, file: string) => {
	path += "/" + file

	const { signedURL, error } = await supabase.storage.from(bucket).createSignedUrl(path, 10)

	if (error) return console.error(error)
	return signedURL
}

export const uploadFile = async (bucket: string, path: string, file: File) => {
	const { error } = await supabase.storage.from(bucket).upload(path, file)

	if (error) return console.error(error)
}

export const updateImg = async (bucket: string, path: string, fileName: string, file: File) => {
	let paths = (await getFilePath(bucket, path)) as { name: string }[]

	paths.forEach(async (p) => {
		if (p.name === fileName.replace("/", "")) {
			const { error } = await supabase.storage.from(bucket).update(path + fileName, file)
			if (error) return console.error(error)
			return
		}
	})

	const { error } = await supabase.storage.from(bucket).update(path + fileName, file)

	if (error) return console.error(error)
}

const updateScriptRevision = async (file: File, revision: number) => {
	let fileString = await file.text()
	let regex = /{\$UNDEF SCRIPT_REVISION}{\$DEFINE SCRIPT_REVISION := '(\d*?)'}/

	let replaceStr =
		"{$UNDEF SCRIPT_REVISION}{$DEFINE SCRIPT_REVISION := '" + revision.toString() + "'}"

	if (fileString.match(regex)) {
		fileString = fileString.replace(regex, replaceStr)
	} else {
		fileString = replaceStr.concat("\n").concat(fileString)
	}

	return new File([fileString], file.name, { type: "text/plain" })
}

export const uploadScript = async (
	script: Script,
	file: File | undefined,
	coverFile: File | undefined,
	bannerFile: File | undefined
) => {
	if (!file) return console.error("No file added!")

	const { data, error } = await supabase.from("scripts").insert(script)

	if (error) return console.error(error)

	script = data[0]

	file = await updateScriptRevision(file, script.revision)

	//rename all scripts to script so we can always fetch them later regardless of name changes.
	let path = script.id + "/" + pad(script.revision, 9) + "/script.simba"

	uploadFile("scripts", path, file)

	if (coverFile) {
		uploadFile("imgs", "scripts/" + script.id + "/cover.jpg", coverFile)
	}

	if (bannerFile) {
		uploadFile("imgs", "scripts/" + script.id + "/banner.jpg", bannerFile)
	}
}

export const updateScript = async (
	script: Script,
	file: File | undefined,
	coverFile: File | undefined,
	bannerFile: File | undefined
) => {
	if (file) script.revision += 1
	const { error } = await supabase.from("scripts").update(script).match({ id: script.id })

	if (error) return console.error(error)

	if (file) {
		file = await updateScriptRevision(file, script.revision)
		let path = script.id + "/" + pad(script.revision, 9) + "/script.simba"

		uploadFile("scripts", path, file)
	}

	if (coverFile) {
		updateImg("imgs", "scripts/" + script.id, "/cover.jpg", coverFile)
	}

	if (bannerFile) {
		updateImg("imgs", "scripts/" + script.id, "/banner.jpg", bannerFile)
	}
}
