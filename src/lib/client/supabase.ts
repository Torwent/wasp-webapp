import type {
	Category,
	FAQEntry,
	ProfileRoles,
	Script,
	Scripter,
	StatsTotal,
	SubCategory,
	Tutorial
} from "$lib/types/collection"
import { UUID_V4_REGEX, formatError } from "$lib/utils"
import type { SupabaseClient } from "@supabase/supabase-js"
import { error } from "@sveltejs/kit"

//Cache
const SCRIPT_CACHE_MAX_AGE = 2 * 60 * 1000

interface CachedStatsTotal {
	data: StatsTotal
	timestamp: number
}

interface CachedCategories {
	data: Awaited<Category[]>
	timestamp: number
}

interface CachedSubcategories {
	data: Awaited<SubCategory[]>
	timestamp: number
}

interface CachedTooltips {
	data: Awaited<Category[]>
	timestamp: number
}

interface CachedScript {
	data: Script
	timestamp: number
}

interface CachedFAQ {
	data: FAQEntry[]
	timestamp: number
}

interface CachedTutorial {
	data: Tutorial
	timestamp: number
}

let statsTotal: CachedStatsTotal | null = null
const scripts: Map<string, CachedScript> = new Map()
const tutorials: Map<string, CachedTutorial> = new Map()
const faqs: Map<string, CachedFAQ> = new Map()

export class WaspProfile {
	static async getWarning(supabase: SupabaseClient, id: string | null | undefined) {
		if (!id) return false
		const { data, error: err } = await supabase
			.schema("profiles")
			.from("private")
			.select("warning")
			.eq("id", id)
			.single<boolean>()
		if (err) {
			console.error(err)
			return false
		}
		return data
	}

	static async updateWarning(supabase: SupabaseClient, id: string) {
		const { error: err } = await supabase
			.schema("profiles")
			.from("private")
			.update({ warning: true })
			.eq("id", id)

		if (err)
			error(
				500,
				"Server error, this is probably not an issue on your end!\n" +
					"UPDATE profiles.private failed!\n\n" +
					formatError(err)
			)
	}
}

export async function getStatsTotal(supabase: SupabaseClient) {
	const now = Date.now()
	if (statsTotal && now - statsTotal.timestamp < 60 * 60 * 1000) {
		return statsTotal.data
	}

	const { data, error: err } = await supabase.rpc("get_stats_total").single<StatsTotal>()

	if (err) {
		error(
			500,
			"Server error, this is probably not an issue on your end!\n" +
				"SELECT get_stats_total postgres function failed!\n\n" +
				formatError(err)
		)
	}

	statsTotal = { data, timestamp: now }
	return data
}

export function canEdit(
	id: string | null | undefined,
	roles: ProfileRoles | null | undefined,
	author: string | null | undefined
) {
	if (!id || !roles || !author) return false
	if (roles.administrator || roles.moderator) return true
	return id === author
}

export async function getScripter(supabase: SupabaseClient, slug: string) {
	const { data, error: err } = await supabase
		.schema("profiles")
		.from("scripters")
		.select(
			`id, stripe, realname, description, content, url, github, paypal_id, content, profiles (username, avatar)`
		)
		.eq(UUID_V4_REGEX.test(slug) ? "id" : "url", slug)
		.single<Scripter>()

	if (err) {
		error(
			500,
			"Server error, this is probably not an issue on your end!\n" +
				"SELECT profiles.scripters failed!\n\n" +
				"Slug: " +
				slug +
				"\n" +
				formatError(err)
		)
	}

	return data
}

export class WaspCategories {
	static #CACHE_MAX_AGE = 60 * 60 * 1000
	static #categories: CachedCategories | null = null
	static #subcategories: CachedSubcategories | null = null
	static #tooltips: CachedTooltips | null = null

	static async #fetchCategories(supabase: SupabaseClient) {
		console.log("🔨 Fetching categories")
		const { data, error: err } = await supabase
			.schema("scripts")
			.from("categories")
			.select("name, emoji")

		if (err) {
			error(
				500,
				"Server error, this is probably not an issue on your end!\n" +
					"SELECT scripts.categories failed!\n\n" +
					formatError(err)
			)
		}

		return data
	}

	static async getCategories(supabase: SupabaseClient) {
		const now = Date.now()

		if (this.#categories && now - this.#categories.timestamp < this.#CACHE_MAX_AGE) {
			return this.#categories.data
		}

		const data = await this.#fetchCategories(supabase)
		this.#categories = { data, timestamp: now }
		return data
	}

	static async #fetchSubCategories(supabase: SupabaseClient) {
		console.log("🔧 Fetching subcategories")
		const { data, error: err } = await supabase
			.schema("scripts")
			.from("subcategories")
			.select("category, name, emoji")

		if (err) {
			error(
				500,
				"Server error, this is probably not an issue on your end!\n" +
					"SELECT scripts.subcategories failed!\n\n" +
					formatError(err)
			)
		}

		return data
	}

	static async getSubCategories(supabase: SupabaseClient) {
		const now = Date.now()

		if (this.#subcategories && now - this.#subcategories.timestamp < this.#CACHE_MAX_AGE) {
			return this.#subcategories.data
		}

		const data = await this.#fetchSubCategories(supabase)
		this.#subcategories = { data, timestamp: now }
		return data
	}

	static async #fetchTooltips(
		categoriesPromise: ReturnType<typeof this.getCategories>,
		subcategoriesPromise: ReturnType<typeof this.getSubCategories>
	) {
		console.log("💥 Processing tooltips")
		const promises = await Promise.all([categoriesPromise, subcategoriesPromise])
		const converted = promises[1].map((subcategory) => {
			return { name: subcategory.name, emoji: subcategory.emoji }
		})
		return [...promises[0], ...converted]
	}

	static async getTooltips(supabase: SupabaseClient) {
		const now = Date.now()

		if (this.#tooltips && now - this.#tooltips.timestamp < this.#CACHE_MAX_AGE) {
			return this.#tooltips.data
		}

		const data = await this.#fetchTooltips(
			this.getCategories(supabase),
			this.getSubCategories(supabase)
		)
		this.#tooltips = { data, timestamp: now }
		return data
	}

	static async getScriptTooltips(categories: string[], supabase: SupabaseClient) {
		const tooltips = await this.getTooltips(supabase)
		const result: typeof tooltips = []

		outter: for (let i = 0; i < tooltips.length; i++) {
			for (let j = categories.length; j > 0; j--) {
				if (tooltips[i].name === categories[j]) {
					result.push(tooltips[i])
					categories.splice(j, 1)
					continue outter
				}
			}
		}

		return result
	}
}

export async function getScript(
	supabase: SupabaseClient,
	slug: string,
	isUUID: boolean | null = null
) {
	const now = Date.now()
	const cached = scripts.get(slug)

	if (cached && now - cached.timestamp < SCRIPT_CACHE_MAX_AGE) {
		return cached.data
	}

	console.log("💥 Fetching script " + slug)
	const { data, error: err } = await supabase
		.schema("scripts")
		.from("scripts")
		.select(
			`id, title, description, content, url, categories, subcategories, published,
				min_xp, max_xp, min_gp, max_gp,
				protected!inner (assets, username, author_id, revision, revision_date, broken)`
		)
		.eq((isUUID == null && UUID_V4_REGEX.test(slug)) || isUUID ? "id" : "url", slug)
		.single<Script>()

	if (err) {
		error(
			500,
			"Server error, this is probably not an issue on your end!\n" +
				"SELECT scripts.scripts failed!\n\n" +
				formatError(err)
		)
	}

	scripts.set(slug, { data, timestamp: now })
	return data
}

export async function scriptExists(
	supabase: SupabaseClient,
	slug: string,
	isUUID: boolean | null = null
) {
	if (scripts.has(slug)) return true

	console.log("💥 Fetching script " + slug)
	const { data, error: err } = await supabase
		.schema("scripts")
		.from("scripts")
		.select(
			`id, title, description, content, url, categories, subcategories, published,
				min_xp, max_xp, min_gp, max_gp,
				protected!inner (assets, username, author_id, revision, revision_date, broken)`
		)
		.eq((isUUID == null && UUID_V4_REGEX.test(slug)) || isUUID ? "id" : "url", slug)
		.single<Script>()

	if (err) return false

	scripts.set(slug, { data, timestamp: Date.now() })
	return true
}

export async function canDownload(
	supabase: SupabaseClient,
	roles: ProfileRoles | null,
	script_id: string | null
) {
	if (!roles || !script_id) return false
	if (roles.administrator) return true
	if (roles.moderator) return true
	if (roles.tester) return true

	const { data } = await supabase
		.schema("profiles")
		.rpc("can_access", { script_id: script_id })
		.returns<boolean>()

	return data ?? false
}

export async function getSignedURL(
	supabase: SupabaseClient,
	bucket: string,
	path: string,
	file: string
) {
	path += "/" + file

	const { data, error: err } = await supabase.storage.from(bucket).createSignedUrl(path, 10)

	if (err) {
		error(
			501,
			"Server error, this is probably not an issue on your end!\n" +
				"Get sign url for " +
				bucket +
				" to " +
				path +
				" failed!\n\n" // +
			//TODO: formatError(err)
		)
	}

	return data.signedUrl
}

export async function getTutorial(
	supabase: SupabaseClient,
	slug: string,
	isUUID: boolean | null = null
) {
	const now = Date.now()
	const cached = tutorials.get(slug)

	if (cached && now - cached.timestamp < SCRIPT_CACHE_MAX_AGE) {
		return cached.data
	}

	console.log("💥 Fetching script " + slug)
	const { data, error: err } = await supabase
		.schema("info")
		.from("tutorials")
		.select("title, description, content, level, order, username, url, published, author_id")
		.eq((isUUID == null && UUID_V4_REGEX.test(slug)) || isUUID ? "id" : "url", slug)
		.single<Tutorial>()

	if (err) {
		error(
			500,
			"Server error, this is probably not an issue on your end!\n" +
				"SELECT info.tutorials failed!\n\n" +
				formatError(err)
		)
	}

	tutorials.set(slug, { data, timestamp: now })
	return data
}

export async function getFAQ(supabase: SupabaseClient, table: string) {
	const now = Date.now()
	const cached = faqs.get(table)

	if (cached && now - cached.timestamp < SCRIPT_CACHE_MAX_AGE) {
		return cached.data
	}

	console.log("💥 Fetching FAQs: " + table)
	const { data, error: err } = await supabase
		.schema("info")
		.from(table)
		.select("title, content")
		.order("id")

	if (err) {
		error(
			500,
			"Server error, this is probably not an issue on your end!\n" +
				"SELECT info.faqs failed!\n\n" +
				formatError(err)
		)
	}

	faqs.set(table, { data, timestamp: now })
	return data
}
