import { getUsername } from "$lib/server/supabase.server"
import type { Tutorial } from "$lib/types/collection"
import { encodeSEO } from "$lib/utils"
import { error, json } from "@sveltejs/kit"

async function getPosts(slug: string) {
	const paths = import.meta.glob("/src/wasp-info/tutorials/*.md", { eager: true })

	for (const path in paths) {
		const file = paths[path]

		const order = path.split("/").at(-1)?.replace(".md", "")
		if (file && typeof file === "object" && "metadata" in file && order) {
			const metadata = file.metadata as Omit<Tutorial, "slug">
			const username = await getUsername(metadata.author)
			if (!username) continue

			const url = encodeSEO(metadata.title + " by " + username)

			if (slug === order || slug === url)
				return { ...metadata, order: parseInt(order), url } satisfies Tutorial
		}
	}

	error(404, "Couldn't find " + slug)
}

export async function GET({ params: { slug } }) {
	const tutorial = await getPosts(slug)
	return json(tutorial)
}
