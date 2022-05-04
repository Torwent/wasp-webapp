import { supabase } from "$lib/supabase"

export const loadPublicFiles = async (bucket, folder) => {
	const { data, error } = await supabase.storage.from(bucket).list(folder, {
		limit: 20,
		offset: 0,
		sortBy: { column: "name", order: "asc" }
	})

	if (error) {
		return console.error(error)
	}

	let imgURLs = []

	for (let i of data) {
		const { publicURL, errorUrl } = supabase.storage
			.from(bucket)
			.getPublicUrl(folder + "/" + i.name)

		if (errorUrl) {
			return console.error(error)
		}

		imgURLs.push(publicURL.replaceAll(" ", "%20"))
	}

	return imgURLs
}

export const getSignedURL = async (bucket, path, file) => {
	const { data, dirError } = await supabase.storage.from(bucket).list(path)

	if (dirError) return console.error(dirError)

	data.sort((a, b) => (a.name > b.name ? 1 : b.name > a.name ? -1 : 0))

	path += data[0].name + "/" + file

	const { signedURL, error } = await supabase.storage.from(bucket).createSignedUrl(path, 10)

	if (error) {
		return console.error(error)
	}

	return signedURL
}
