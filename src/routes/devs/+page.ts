import { browser } from "$app/environment"
import { encodeSEO } from "$lib/utils"
import { redirect } from "@sveltejs/kit"
import type { PageLoad } from "./$types"
import { supabaseHelper } from "$lib/backend/auth"
import type { Developer } from "$lib/backend/types"

export const load: PageLoad = async ({ url, depends }) => {
	depends("developers:devs")

	const pageStr = url.searchParams.get("page") || "-1"
	const page = Number(pageStr) < 0 || Number.isNaN(Number(pageStr)) ? 1 : Number(pageStr)
	const search = decodeURIComponent(url.searchParams.get("search") || "").trim()
	const range = 10

	const start = (page - 1) * range
	const finish = start + range

	let devsData

	if (search === "") {
		devsData = await supabaseHelper
			.from("devs")
			.select("real_name, username, description, github, paypal_id, content", {
				count: "exact"
			})
			.order("username", { ascending: true })
			.range(start, finish)
	} else {
		devsData = await supabaseHelper
			.from("devs")
			.select("real_name, username, description, github, paypal_id, content", {
				count: "exact"
			})
			.ilike("search_devs", "%" + search + "%")
	}

	const { data, count, error } = devsData

	if (error) {
		console.error(error)
		throw redirect(303, "/devs")
	}
	const devs = data

	if (!browser && devs.length === 1) throw redirect(303, "/devs/" + encodeSEO(devs[0].username))

	return { devs, count, range }
}
