import { supabase } from "$lib/database/supabase"

interface VersionJSON {
	name: string
	time: string
	download_url: string
	options_url: string
	notes: string
}

interface simbaPackage {
	id: string
	name: string
	body: string
	versions: string
	pkg_file: string
}

const error = (pkg: string) => {
	return {
		status: 404,
		error: new Error(pkg + " not found.")
	}
}

const getData = async (pkg: string) => {
	const { data, error } = await supabase.from("packages").select().eq("name", pkg)

	if (error) return console.error(error)

	return data[0] as simbaPackage
}

export const getPackage = async (pkg: string) => {
	let data = await getData(pkg)
	if (data == null) return error(pkg)

	return data.body
}

export const getVersions = async (pkg: string) => {
	let data = await getData(pkg)
	if (data == null) return error(pkg)

	return data.versions
}

export const getPkgFile = async (pkg: string) => {
	let data = await getData(pkg)
	if (data == null) return error(pkg)

	return data.pkg_file
}
