export const loadError = (page: string = "") => {
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

export async function convertTime(t: number): Promise<string> {
	let days, hours, minutes, seconds, total_hours, total_minutes, total_seconds: number
	let result: string = ""

	total_seconds = Math.floor(t / 1000)
	total_minutes = Math.floor(total_seconds / 60)
	total_hours = Math.floor(total_minutes / 60)
	days = Math.floor(total_hours / 24)

	seconds = total_seconds % 60
	minutes = total_minutes % 60
	hours = total_hours % 24

	if (days > 0) result += days.toString() + "d "
	if (hours > 0) result += hours.toString() + "h "
	if (minutes > 0) result += minutes.toString() + "m "

	if ((days = 0 && seconds > 0)) result += seconds.toString() + "s"

	return result
}

export async function formatRSNumber(n: number): Promise<string> {
	let i: number = 0
	let f: number = n
	let arr: string[] = ["", "K", "M", "B", "T"]

	while (Math.abs(f) >= 1000) {
		i++
		f = f / 1000
	}

	return parseFloat(f.toFixed(2)).toString() + " " + arr[i]
}
