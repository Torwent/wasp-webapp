import { supabase } from "$lib/supabase"

export const loadPublicFiles = async (bucket: string, folder: string) => {
	const { data, error } = await supabase.storage.from(bucket).list(folder, {
		limit: 20,
		offset: 0,
		sortBy: { column: "name", order: "asc" }
	})

	if (error) {
		return console.error(error)
	}

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
	let data = await getFilePath(bucket, path)

	if (!data) return console.error("Path doesn't exist")

	path += data[data.length - 1].name + "/" + file

	const { signedURL, error } = await supabase.storage.from(bucket).createSignedUrl(path, 10)

	if (error) {
		return console.error(error)
	}

	return signedURL
}

export interface ScriptData {
	id: string
	title: string
	revision: number
}

export const uploadFile = async (bucket: string, path: string, file: File) => {
	const { error } = await supabase.storage.from(bucket).upload(path, file)

	if (error) {
		return console.error(error)
	}
}

export const uploadScript = async (scriptData: ScriptData, file: File) => {
	const pad = (n: number, size: number) => {
		var s = n + ""
		while (s.length < size) s = "0" + s
		return s
	}

	let fileString = await file.text()
	let regex = /{\$UNDEF SCRIPT_REVISION}{\$DEFINE SCRIPT_REVISION := '(\d*?)'}/
	let replaceStr =
		"{$UNDEF SCRIPT_REVISION}{$DEFINE SCRIPT_REVISION := '" + scriptData.revision.toString() + "'}"

	if (fileString.match(regex)) {
		console.log("here0")
		fileString = fileString.replace(regex, replaceStr)
	} else {
		console.log("here1")
		fileString = replaceStr.concat("\n").concat(fileString)
	}
	console.log(fileString)

	file = new File([fileString], scriptData.id + ".simba", { type: "text/plain" })

	let path =
		scriptData.id +
		"/" +
		pad(scriptData.revision, 9) +
		"/" +
		scriptData.title.toLowerCase().replace(/\s/g, "_") +
		".simba"

	uploadFile("scripts", path, file)
}
