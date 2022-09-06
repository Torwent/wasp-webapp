import { supabase } from "$lib/supabase"

interface simbaPackage {
	id: string
	name: string
	body: string
	versions: string
	pkg_file: string
}

const headers = {
	"Cache-Control": "max-age=0, s-maxage=3600",
	"Content-Type": "application/json"
}

const getData = async (pkg: string) => {
	const { data, error } = await supabase.from("packages").select().eq("name", pkg)

	if (error) return console.error(error)

	return data[0] as simbaPackage
}

export const getPackage = async (pkg: string) => {
	console.log(pkg)
	let data = await getData(pkg)
	if (data == null)
		return {
			status: 404,
			error: new Error(`Page not found.`)
		}

	return { headers, body: JSON.stringify(data.body, null, 2) }
}

export const getVersions = async (pkg: string) => {
	let data = await getData(pkg)
	if (data == null)
		return {
			status: 404,
			error: new Error(`Page not found.`)
		}

	return { headers, body: JSON.stringify(data.versions, null, 2) }
}

export const getPkgFile = async (pkg: string) => {
	let data = await getData(pkg)
	if (data == null)
		return {
			status: 404,
			error: new Error(`Page not found.`)
		}

	return { headers, body: data.pkg_file }
}
