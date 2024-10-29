import type { Tutorial } from "$lib/types/collection"
import sharp from "sharp"
import { getUsername } from "./supabase.server"
import { encodeSEO } from "$lib/utils"

export async function checkServerImageDimensions(
	file: File,
	width: number,
	height: number
): Promise<boolean> {
	if (file == null) return false
	try {
		const image = sharp(Buffer.from(await file.arrayBuffer()))
		const metadata = await image.metadata()
		return metadata.width === width && metadata.height === height
	} catch (error) {
		console.error("checkServerImageDimensions() failed: " + JSON.stringify(error))
		return false
	}
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

export async function getFullTutorials() {
	let tutorials: Tutorial[] = []

	const paths = import.meta.glob("/src/wasp-info/tutorials/*.md", { eager: true })

	for (const path in paths) {
		const file = paths[path]
		const order = path.split("/").at(-1)?.replace(".md", "")

		if (!file) continue
		if (!order) continue
		if (typeof file !== "object") continue
		if (!("metadata" in file) || !("default" in file)) continue

		const metadata = file.metadata as Omit<Tutorial, "slug">
		const username = await getUsername(metadata.author)

		if (!username) continue

		const url = encodeSEO(metadata.title + " by " + username)

		let content = ""
		try {
			const html = file.default as any
			content = html.render().html
		} catch (e) {
			console.error(e)
		}
		const tutorial = {
			...metadata,
			username,
			order: parseInt(order),
			url,
			content
		} satisfies Tutorial
		tutorials.push(tutorial)
	}

	return tutorials.sort((first, second) => first.order - second.order)
}

export async function getTutorial(slug: string) {
	const tutorials = await tutorialsPromise
	return tutorials.find((tutorial) => tutorial.url === slug)
}
