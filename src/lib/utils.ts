export const pad = (n: number, size: number) => {
	var s = n + ""
	while (s.length < size) s = "0" + s
	return s
}
