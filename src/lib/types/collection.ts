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

export interface ScripterBase {
	realname: string | undefined
	description: string | undefined
	url: string
	profiles: {
		username: string
		avatar: string
	}
}

export interface Scripter extends ScripterBase {
	id: string
	github: string | undefined
	paypal_id: string | undefined
	content: string | undefined
}

//stats
export type StatsTotal = Database["public"]["Functions"]["get_stats_total"]["Returns"][number]
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

export type Tutorial = {
	title: string
	description: string
	content: string
	level: number
	username: string
	url: string
	published: boolean
}

//scripts
export interface ScriptBase {
	title: string
	description: string
	published: boolean
	url: string
	tooltip_emojis: string
	tooltip_names: string
	protected: {
		assets: string
		username: string
		avatar: string
	}
}
