export const API_URL = "https://api.waspscripts.com" //http://localhost:8080
export const UUID_V4_REGEX =
	/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[4][0-9a-fA-F]{3}-[89AB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/i

export const MB_SIZE = 100000
export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg"]

export const loadError = (page = "") => {
	if (page == null) page = "page"
	return {
		status: 404,
		error: new Error(page + " not found.")
	}
}

export const pad = (n: number, size: number) => {
	let s = n + ""
	while (s.length < size) s = "0" + s
	return s
}

export const search = (content: string, search: string) => {
	content = content.toLowerCase()
	search = search.toLowerCase()
	let i = 0,
		n = -1,
		l: string

	for (; (l = search[i++]); ) {
		if (!~(n = content.indexOf(l, n + 1))) {
			return false
		}
	}
	return true
}

export const validateEmail = (input: string) => {
	return input.match(/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/)
}

export const validateIp = (input: string) => {
	const ipv4 =
		"(([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])\\.){3}([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])"

	const ipv6 = "((([0-9a-fA-F]){1,4})\\:){7}([0-9a-fA-F]){1,4}"

	return input.match(ipv4) || input.match(ipv6)
}

export function convertTime(t: number): string {
	let result = ""

	const total_seconds = Math.floor(t / 1000)
	const total_minutes = Math.floor(total_seconds / 60)
	const total_hours = Math.floor(total_minutes / 60)
	const total_days = Math.floor(total_hours / 24)

	const years = Math.floor(total_days / 365)

	const seconds = total_seconds % 60
	const minutes = total_minutes % 60
	const hours = total_hours % 24
	const days = total_days % 365

	if (years > 0) result += years.toString() + "y "
	if (days > 0) result += days.toString() + "d "
	if (hours > 0) result += hours.toString() + "h "
	if (minutes > 0) result += minutes.toString() + "m"

	if (days === 0 && seconds > 0) result += " " + seconds.toString() + "s"

	return result
}

export function formatRSNumber(n: number): string {
	let i = 0
	let f: number = n
	const arr: string[] = ["", "K", "M", "B", "T"]

	while (Math.abs(f) >= 1000) {
		i++
		f = f / 1000
	}

	return parseFloat(f.toFixed(2)).toString() + " " + arr[i]
}

export function capitalizeString(string: string): string {
	return string.charAt(0).toUpperCase() + string.slice(1)
}

export function randomString() {
	const n = Math.random() + 1
	return n.toString(36).substring(7)
}

export function cropString(str: string, length = 80) {
	if (str.length > length) {
		str = str.substring(0, length) + "..."
	}

	return str
}

export function encodeSEO(url: string) {
	url = encodeURI(url.toLocaleLowerCase())
		.replaceAll("%20", "-")
		.replace(/&/g, "-and-")
		.replace(/[^a-z\-]/g, "")
		.replace(/-+/g, "-")
		.replace(/^-*/, "")
		.replace(/-*$/, "")
	return url
}
