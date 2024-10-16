import { getUsername } from "$lib/server/supabase.server"
import type { Tutorial } from "$lib/types/collection"
import { encodeSEO } from "$lib/utils"

async function getTutorials() {
	console.log("LOADING TUTORIALS!")
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

const tutorialsPromise = getTutorials()

async function getPublishedTutorials() {
	const tutorials = await tutorialsPromise
	return tutorials.filter((tutorial) => tutorial.published)
}

const publishedTutorialPromise = getTutorials()

async function getTutorialLevels(level: number) {
	const tutorials = await publishedTutorialPromise
	return tutorials.filter((tutorial) => tutorial.level === level)
}

const tutorialLevels: Promise<Tutorial[]>[] = [
	getTutorialLevels(0),
	getTutorialLevels(1),
	getTutorialLevels(2)
]

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
	if (level != -1) {
		tutorials = await tutorialLevels[level]
	} else {
		tutorials = await publishedTutorialPromise
	}

	const filteredTutorials = tutorials.slice(
		Math.max(0, start),
		Math.min(tutorials.length, finish + 1)
	)

	return { tutorials: filteredTutorials, amount, count: tutorials.length }
}
