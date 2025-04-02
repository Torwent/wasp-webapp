import { getScripter } from "$lib/client/supabase"
import { mdvsvexCompile } from "$lib/server/markdown.server"
import { getScripts, searchScriptsIndex } from "$lib/server/scripts.server"

export const load = async ({
	url: { searchParams },
	params: { slug },
	locals: { supabaseServer, user, getRoles }
}) => {
	const pageStr = searchParams.get("page") || "-1"
	const page = Number(pageStr) < 0 || Number.isNaN(Number(pageStr)) ? 1 : Number(pageStr)

	const amountN = Number(searchParams.get("amount") || "12")
	const amount = amountN < 0 || Number.isNaN(amountN) ? 1 : amountN

	const search = decodeURIComponent(searchParams.get("search") || "").trim()

	const start = (page - 1) * amount
	const finish = start + amount - 1

	const promises = await Promise.all([getScripter(supabaseServer, slug), getRoles()])

	const scripter = promises[0]
	const roles = promises[1]

	let scripts = search !== "" ? searchScriptsIndex(search) : await getScripts()
	scripts = scripts.filter((script) => script.protected.author_id === scripter.id)

	if (search !== "" && scripter.id != user?.id && !roles?.moderator && !roles?.administrator) {
		scripts = scripts.filter((script) => script.published === true)
	}

	const filteredScripts = scripts.slice(Math.max(0, start), Math.min(scripts.length, finish + 1))

	if (scripter.content) scripter.content = (await mdvsvexCompile(scripter.content)).code

	return { scripter, scripts: filteredScripts, amount, count: scripts.length }
}
