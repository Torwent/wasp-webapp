import FlexSearch from "flexsearch"
import type { Tutorial } from "$lib/types/collection"
import { getUsername } from "$lib/server/supabase.server"
import { encodeSEO } from "$lib/utils"

let tutorialsIndex: FlexSearch.Index
let tutorials: Tutorial[]

export function createTutorialsIndex(data: Tutorial[]) {
	tutorialsIndex = new FlexSearch.Index({ tokenize: "forward" })

	data.forEach((tutorial, i) => {
		const item = `${tutorial.title} ${tutorial.description} ${tutorial.content}`
		tutorialsIndex.add(i, item)
	})

	tutorials = data
}

export function searchTutorialsIndex(searchTerm: string) {
	const match = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") //escape special regex characters
	const results = tutorialsIndex.search(match)
	return results.map((index) => tutorials[index as number])
}

export async function getTutorials() {
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
			tutorials.push(tutorial)
		}
	}

	return tutorials.sort((first, second) => first.order - second.order)
}

export const tutorialsPromise = getTutorials()

export async function getTutorial(slug: string) {
	const tutorials = await tutorialsPromise
	return tutorials.find((tutorial) => tutorial.url === slug)
}
