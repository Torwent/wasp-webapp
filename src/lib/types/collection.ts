import type { Database } from "./supabase"

//profile
export type ProfileBase = Database["profiles"]["Tables"]["profiles"]["Row"]
export interface ProfileRoles {
	administrator: Boolean
	moderator: Boolean
	scripter: Boolean
	tester: Boolean
	vip: Boolean
	premium: Boolean
	banned: Boolean
}
export interface Profile extends ProfileBase {
	private: Database["profiles"]["Tables"]["private"]["Row"]
	roles: ProfileRoles
	subscription: Database["profiles"]["Tables"]["subscription"]["Row"][]
	free_access: Database["profiles"]["Tables"]["free_access"]["Row"][]
}

export type ProfileSubscription = Database["profiles"]["Tables"]["subscription"]["Row"]

export interface ScripterBase {
	realname: string | undefined
	description: string | undefined
	url: string
	profiles: {
		username: string
		avatar: string
	}
}

export interface SimpleScripter {
	url: string
	profiles: { username: string }
}

export interface Scripter extends ScripterBase {
	id: string
	stripe: string | undefined
	github: string | undefined
	paypal_id: string | undefined
	content: string | undefined
}

export interface ScripterProfile {
	profiles: { username: string }
}

//stats
export type StatsTotal = Database["public"]["Functions"]["get_stats_total"]["Returns"][number]

export type ScripterStats = Database["scripts"]["Functions"]["get_site_stats"]["Returns"][number]

export type Stats = {
	username: string
	experience: number
	gold: number
	levels: number
	runtime: number
}

//info
export type FAQEntry = {
	content: string
	title: string
}

export interface Tutorial {
	order: number
	title: string
	description: string
	content: string
	created_at: string
	updated_at: string
	level: number
	author: string
	username: string
	coauthors: string[] | null
	published: boolean
	url: string
}

//scripts
export interface ScriptBase {
	title: string
	description: string
	published: boolean
	url: string
	tooltip_emojis: string[]
	tooltip_names: string[]
	protected: {
		assets: string
		username: string
		avatar: string
	}
}

export interface ScriptReplace {
	id: string
	title: string
	description: string
	content: string
	min_xp: number
	max_xp: number
	min_gp: number
	max_gp: number
	protected: {
		username: string
		revision: number
		revision_date: number
	}
}

export interface Script {
	id: string
	title: string
	description: string
	content: string
	url: string
	categories: string[]
	subcategories: string[]
	published: boolean
	min_xp: number
	max_xp: number
	min_gp: number
	max_gp: number
	protected: {
		assets: string
		username: string
		author_id: string
		revision: number
		revision_date: number
		broken: boolean
	}
}

export interface ScriptSimple {
	id: string
	title: string
	url: string
	product: string
	protected: { username: string }
}

export interface ScriptFeatured {
	scripts: {
		url: string
		title: string
		description: string
		tooltip_emojis: string
		protected: {
			assets: string
			username: string
			avatar: string
		}
	}
}

export interface CheckboxType {
	id: number
	name: string
	emoji: string
	main: boolean
	checked: boolean
}

export interface Tooltip {
	name: string
	emoji: string
}

export interface ProductData {
	id: string
	user_id: string
	name: string
	bundle: string | null
	script: string | null
	active: boolean
	profiles: { username: string }
}

export type Price = Database["scripts"]["Tables"]["prices"]["Row"]

export interface ProductEx {
	id: string
	user_id: string
	name: string
	bundle: string | null
	script: string | null
	bundles: { username: string } | null
	scripts: {
		url: string
		protected: { username: string }
	} | null
	active: boolean
}

export interface Subscription {
	subscription: string
	product: string
	price: string
	date_start: string
	date_end: string
	cancel: boolean
	disabled: boolean
}

export interface FreeAccess {
	id: string
	product: string
	date_start: string
	date_end: string
}

export type Bundle = Database["scripts"]["Tables"]["bundles"]["Row"]

export type Product = Database["scripts"]["Tables"]["products"]["Row"]

export interface Category {
	name: string
	emoji: string
}

export interface SubCategory extends Category {
	category: string
}
