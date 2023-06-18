export const load = async ({ setHeaders }) => {
	setHeaders({
		"cache-control": "max-age=60"
	})

	return
}
