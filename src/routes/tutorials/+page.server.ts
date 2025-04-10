import { tutorialsPromise } from "$lib/server/tutorials.server"
import type { Tutorial } from "$lib/types/collection"
import FlexSearch from "flexsearch"

let tutorialsIndex: FlexSearch.Index
let tutorials: Tutorial[]

function createTutorialsIndex(data: Tutorial[]) {
	tutorialsIndex = new FlexSearch.Index({ tokenize: "full", cache: true, language: "en" })
	data.forEach((tutorial, i) => {
		const item = `${tutorial.title} ${tutorial.description} ${tutorial.content}`
		tutorialsIndex.add(i, item)
	})

	tutorials = data
}

function searchTutorialsIndex(searchTerm: string) {
	const match = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") //escape special regex characters
	const indices = tutorialsIndex.search(match) as number[]
	return indices.map((index) => tutorials[index])
}

async function getPublishedTutorials() {
	const tutorials = await tutorialsPromise

	createTutorialsIndex(tutorials)
	return tutorials
}

const publishedTutorialPromise = getPublishedTutorials()

async function getTutorialLevels(level: number) {
	const tutorials = await publishedTutorialPromise
	const filtered = tutorials.filter((tutorial) => tutorial.level === level)
	return filtered
}

const tutorialLevelsPromises = [getTutorialLevels(0), getTutorialLevels(1), getTutorialLevels(2)]

export async function load({ depends, url }) {
	depends("wasp:tutorials")
	const pageN = Number(url.searchParams.get("page") || "-1")
	const page = pageN < 0 || Number.isNaN(pageN) ? 1 : pageN

	const amountN = Number(url.searchParams.get("amount") || "10")
	const amount = amountN < 0 || Number.isNaN(amountN) ? 1 : amountN

	const search = decodeURIComponent(url.searchParams.get("search") || "").trim()

	const levelN = Number(url.searchParams.get("level") || "-1")
	const level = Number.isNaN(levelN) ? 0 : levelN

	const start = (page - 1) * amount
	const finish = start + amount - 1

	let tutorials: Tutorial[]

	if (search !== "") {
		tutorials = searchTutorialsIndex(search)
		if (level != -1) {
			tutorials = tutorials.filter((t) => t.level === level)
		}
	} else {
		if (level != -1) {
			tutorials = await tutorialLevelsPromises[level]
		} else {
			tutorials = await publishedTutorialPromise
		}
	}

	const filteredTutorials = tutorials.slice(
		Math.max(0, start),
		Math.min(tutorials.length, finish + 1)
	)

	return { tutorials: filteredTutorials, amount, count: tutorials.length }
}
