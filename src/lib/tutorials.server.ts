import FlexSearch from "flexsearch"
import type { Tutorial } from "./types/collection"
import { tutorialsPromise } from "./server/utils.server"

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
