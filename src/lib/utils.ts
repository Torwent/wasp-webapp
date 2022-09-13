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
