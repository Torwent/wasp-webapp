import type { PageLoad } from "./$types"

export const load: PageLoad = async ({ setHeaders }) => {
	setHeaders({
		"cache-control": "max-age=60"
	})

	return
}
