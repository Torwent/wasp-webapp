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
