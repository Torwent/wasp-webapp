import type { Database } from "$lib/types/supabase"

export type Prices = Database["scripts"]["Tables"]["prices"]["Row"]
export type Product = Database["scripts"]["Tables"]["products"]["Row"]

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

export type ProfileBase = Database["profiles"]["Tables"]["profiles"]["Row"]
export type ProfileRoles = Database["profiles"]["Tables"]["roles"]["Row"]
export type ProfilePrivate = Database["profiles"]["Tables"]["private"]["Row"]
export type ProfileSubscription = Database["profiles"]["Tables"]["subscription"]["Row"]
export type ProfileSubscriptions = ProfileSubscription[]

export interface Profile extends ProfileBase {
	private: ProfilePrivate
	roles: {
		administrator: Boolean
		moderator: Boolean
		scripter: Boolean
		tester: Boolean
		banned: Boolean
	}
	subscription: ProfileSubscriptions
}

export type Stats = Database["public"]["Tables"]["stats"]["Row"]

export type FAQEntry = Database["public"]["Tables"]["faq_questions"]["Row"]
export type ErrorEntry = Database["public"]["Tables"]["faq_errors"]["Row"]

export type Tutorial = Database["public"]["Tables"]["tutorials"]["Row"]

export type Scripter = Database["profiles"]["Tables"]["scripters"]["Row"]
export interface ScripterWithProfile extends Scripter {
	profiles: ProfileBase
}

export interface ScripterWithProfile extends Scripter {
	profiles: ProfileBase
}

export interface ScripterDashboard {
	id: string
	url: string
	realname: string | null
	github: string | null
	paypal_id: string | null
	stripe: string | null
	profiles: {
		username: string
		avatar: string
		private: {
			email: string
		}
	}
}

export type Category = Database["scripts"]["Tables"]["categories"]["Row"]
export type SubCategory = Database["scripts"]["Tables"]["subcategories"]["Row"]

export interface EmojiTooltip {
	emoji: string
	name: string
}

export interface CheckboxType {
	id: number
	name: string
	emoji: string
	main: boolean
	checked: boolean
}

export interface ScriptSimple {
	id: Database["scripts"]["Tables"]["scripts"]["Row"]["id"]
	title: Database["scripts"]["Tables"]["scripts"]["Row"]["title"]
	username: Database["scripts"]["Tables"]["protected"]["Row"]["username"]
	url: Database["scripts"]["Tables"]["scripts"]["Row"]["url"]
	product: Database["scripts"]["Tables"]["scripts"]["Row"]["product"]
}

export type ScriptBase = Database["scripts"]["Tables"]["scripts"]["Row"]

export type ScriptProtected = Database["scripts"]["Tables"]["protected"]["Row"]

export type StatsSimba = Database["scripts"]["Tables"]["stats_simba"]["Row"]
export type StatsSite = Database["scripts"]["Tables"]["stats_site"]["Row"]

export type Interval = "week" | "month" | "year"

export type Price = Database["scripts"]["Tables"]["prices"]["Row"]

export interface Script extends ScriptBase {
	protected: ScriptProtected
}

export type Bundle = Database["scripts"]["Tables"]["bundles"]["Row"]
