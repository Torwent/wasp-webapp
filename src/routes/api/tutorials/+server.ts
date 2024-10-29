import { getFullTutorials, tutorialsPromise } from "$lib/server/utils.server"
import { json } from "@sveltejs/kit"

export const prerender = true

export async function GET() {
	const tutorials = await getFullTutorials()
	return json(tutorials)
}
