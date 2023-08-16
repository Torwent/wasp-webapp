import type { Database } from "$lib/types/supabase"

export type Prices = Database["public"]["Tables"]["prices"]["Row"]

export type ProfileBase = Database["profiles"]["Tables"]["profiles"]["Row"]
export type ProfileRoles = Database["profiles"]["Tables"]["roles"]["Row"]
export type ProfilePrivate = Database["profiles"]["Tables"]["private"]["Row"]
export type ProfileSubscription = Database["profiles"]["Tables"]["subscriptions"]["Row"]

export interface Profile extends ProfileBase {
	private: ProfilePrivate
	roles: ProfileRoles
	subscriptions: ProfileSubscription
}

export type Stats = Database["public"]["Tables"]["stats"]["Row"]

export type FAQEntry = Database["public"]["Tables"]["faq_questions"]["Row"]
export type ErrorEntry = Database["public"]["Tables"]["faq_errors"]["Row"]

export type Tutorial = Database["public"]["Tables"]["tutorials"]["Row"]

export type Scripter = Database["profiles"]["Tables"]["scripters"]["Row"]
export interface ScripterWithUsername extends Scripter {
	profiles: ProfileBase
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

export type ScriptBase = Database["scripts"]["Tables"]["scripts"]["Row"]
export type ScriptProtected = Database["scripts"]["Tables"]["protected"]["Row"]

export type StatsSimba = Database["scripts"]["Tables"]["stats_simba"]["Row"]
export type StatsSite = Database["scripts"]["Tables"]["stats_site"]["Row"]

export interface Script extends ScriptBase {
	protected: ScriptProtected
}
