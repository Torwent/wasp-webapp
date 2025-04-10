import type { Tutorial } from "$lib/types/collection"
import { getUsername } from "$lib/server/supabase.server"
import { encodeSEO } from "$lib/utils"
import matter from "gray-matter"
import removeMd from "remove-markdown"

export async function getTutorials() {
	const tutorials: Tutorial[] = []

	const files = import.meta.glob("/src/wasp-info/tutorials/*.md", {
		eager: true,
		query: "?raw",
		import: "default"
	})

	for (const path in files) {
		const raw = files[path] as string
		const order = path.split("/").at(-1)?.replace(".md", "")
		if (!order) continue
		const { data, content } = matter(raw)

		if (!data.title || !data.author || !data.published) continue

		const username = await getUsername(data.author)
		if (!username) continue

		const url = encodeSEO(data.title + " by " + username)

		const tutorial = {
			...data,
			username,
			order: parseInt(order),
			url,
			content: removeMd(content)
		} as Tutorial

		if (tutorial.published) {
			console.log(tutorial)
			tutorials.push(tutorial)
		}
	}

	return tutorials.sort((a, b) => a.order - b.order)
}

export const tutorialsPromise = getTutorials()

export async function getTutorial(slug: string) {
	const tutorials = await tutorialsPromise

	if (/^\d+$/.test(slug)) {
		const n = parseInt(slug, 10)
		return tutorials.find((tutorial) => tutorial.order === n)
	}

	return tutorials.find((tutorial) => tutorial.url === slug)
}
