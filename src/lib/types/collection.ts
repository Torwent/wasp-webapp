import type { Database } from "$lib/types/supabase"

export type Prices = Database["public"]["Tables"]["prices"]["Row"]

export type ProfilePublic = Database["public"]["Tables"]["profiles_public"]["Row"]
export type ProfileProtected = Database["public"]["Tables"]["profiles_protected"]["Row"]
export type ProfilePrivate = Database["public"]["Tables"]["profiles_private"]["Row"]

export interface ProfileProtectedWithPrice extends ProfileProtected {
	prices: Prices
}

type ProfilePublicUsername = {
	profiles_public: {
		username: Database["public"]["Tables"]["profiles_public"]["Row"]["username"]
		avatar_url: Database["public"]["Tables"]["profiles_public"]["Row"]["avatar_url"]
	}
}

export interface Profile extends ProfilePublic {
	profiles_protected: ProfileProtectedWithPrice
	profiles_private: ProfilePrivate
}

export type Stats = Database["public"]["Tables"]["stats"]["Row"]

export type FAQEntry = Database["public"]["Tables"]["faq_questions"]["Row"]
export type ErrorEntry = Database["public"]["Tables"]["faq_errors"]["Row"]

export type Tutorial = Database["public"]["Tables"]["tutorials"]["Row"]
export interface TutorialWithAuthor extends Tutorial, ProfilePublicUsername {}

export type Developer = Database["public"]["Tables"]["developers"]["Row"]
export interface DeveloperWithUsername extends Developer, ProfilePublicUsername {}

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

export interface UpdateScriptStats {
	unique_downloads: Database["public"]["Tables"]["stats_simba"]["Row"]["unique_downloads"]
	monthly_downloads: Database["public"]["Tables"]["stats_simba"]["Row"]["monthly_downloads"]
	previous_months_downloads: Database["public"]["Tables"]["stats_simba"]["Row"]["previous_months_downloads"]
}

export interface Script extends ScriptBase {
	protected: ScriptProtected
}
