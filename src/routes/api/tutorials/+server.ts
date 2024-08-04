import { getUsername } from "$lib/server/supabase.server"
import type { Tutorial } from "$lib/types/collection"
import { encodeSEO } from "$lib/utils"
import { json } from "@sveltejs/kit"

async function getPosts() {
	let tutorials: Tutorial[] = []

	const paths = import.meta.glob("/src/wasp-info/tutorials/*.md", { eager: true })

	for (const path in paths) {
		const file = paths[path]
		const order = path.split("/").at(-1)?.replace(".md", "")

		if (file && typeof file === "object" && "metadata" in file && order) {
			const metadata = file.metadata as Omit<Tutorial, "slug">
			const username = await getUsername(metadata.author)
			if (!username) continue

			const url = encodeSEO(metadata.title + " by " + username)

			const tutorial = { ...metadata, username, order: parseInt(order), url } satisfies Tutorial
			tutorial.published && tutorials.push(tutorial)
		}
	}

	tutorials = tutorials.sort((first, second) => first.order - second.order)

	return tutorials
}

export async function GET() {
	const tutorials = await getPosts()
	return json(tutorials)
}
