import FlexSearch from "flexsearch"
import type { Script } from "$lib/types/collection"
import { supabaseAdmin } from "./supabase.server"
import { fetchScriptByID } from "$lib/client/supabase"

let scriptsIndex = new FlexSearch.Index({ tokenize: "forward" })
let scripts: Script[] = []
let publishedScripts: Script[] = []

function getScriptString(script: Script) {
	return `${script.title} ${script.description} ${script.content} ${script.id} ${script.protected.username} ${script.metadata.status} ${script.metadata.type} ${script.metadata.categories.toString()}`
}

function createScriptsIndex(data: Script[]) {
	scriptsIndex = new FlexSearch.Index({ tokenize: "forward" })
	data.forEach((script, i) => scriptsIndex.add(i, getScriptString(script)))
}

export function searchScriptsIndex(searchTerm: string) {
	const match = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") //escape special regex characters
	const indices = scriptsIndex.search(match) as number[]
	return indices.map((index) => scripts[index])
}

export async function getScripts(): Promise<Script[]> {
	if (scripts.length > 0) return scripts

	const { data, error } = await supabaseAdmin
		.schema("scripts")
		.from("scripts")
		.select(
			`id, title, description, content, url, published,
			protected!inner (assets, username, avatar, author_id, revision, revision_date, broken),
			metadata!inner (status, type, categories),
			stats_limits!inner (xp_min, xp_max, gp_min, gp_max)`
		)
		.order("title", { ascending: true })
		.overrideTypes<Script[]>()

	if (error) {
		console.error(error)
		return scripts
	}

	scripts = data
	return scripts
}

export async function getPublishedScripts() {
	if (publishedScripts.length > 0) return publishedScripts
	await getScripts()
	if (scripts.length === 0) return publishedScripts

	publishedScripts = scripts.filter((script) => script.published)

	createScriptsIndex(publishedScripts)

	return publishedScripts
}

export async function getScriptByID(id: string) {
	const scripts = await getScripts()
	for (let i = 0; i < scripts.length; i++) if (scripts[i].id === id) return scripts[i]
	return null
}

export async function getScriptByURL(url: string) {
	const scripts = await getScripts()
	for (let i = 0; i < scripts.length; i++) if (scripts[i].url === url) return scripts[i]
	return null
}

export async function updateScript(id: string) {
	if (scripts.length === 0) return

	const script = await fetchScriptByID(supabaseAdmin, id)
	if (script == null) return

	const index = scripts.findIndex((s) => s.id === id)
	if (index === -1) {
		scripts.push(script)
		scriptsIndex.add(scripts.length, getScriptString(script))
		return
	}

	scripts[index] = script

	if (!scriptsIndex) await getPublishedScripts()
	else {
		const scriptStr = getScriptString(script)
		scriptsIndex.update(index, scriptStr)
	}
}
