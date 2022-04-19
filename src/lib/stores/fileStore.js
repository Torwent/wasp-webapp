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

export const getSignedURL = async (bucket, file) => {
	const { signedURL, error } = await supabase.storage.from(bucket).createSignedUrl(file, 10)

	if (error) {
		return console.error(error)
	}

	return signedURL
}
