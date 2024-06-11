import { browser } from "$app/environment"
import { goto } from "$app/navigation"

export async function replaceQuery(
	currentPath: string,
	searchParams: URLSearchParams,
	values: Record<string, string>
) {
	if (!browser) return
	let invalidate: boolean = false
	for (let [k, v] of Object.entries(values)) {
		if (!!v && v !== "") searchParams.set(encodeURIComponent(k), encodeURIComponent(v))
		else searchParams.delete(k)

		invalidate = invalidate || v === ""
	}

	const path = currentPath + "?" + searchParams.toString()

	await goto(path, {
		keepFocus: true,
		noScroll: true,
		replaceState: false,
		invalidateAll: invalidate
	})
}
