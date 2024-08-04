import type { Tutorial } from "$lib/types/collection"

export async function load({ fetch }) {
	const response = await fetch("api/tutorials")
	const tutorialsPromise: Promise<Tutorial[]> = response.json()
	return { tutorialsPromise }
}
