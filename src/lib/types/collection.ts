import type { Database } from "$lib/types/supabase"

export type Price = Database["public"]["Tables"]["prices"]["Row"]

export type ProfilePublic = Database["public"]["Tables"]["profiles_public"]["Row"]
export type ProfileProtected = Database["public"]["Tables"]["profiles_protected"]["Row"]
export type ProfilePrivate = Database["public"]["Tables"]["profiles_private"]["Row"]

export interface ProfileProtectedWithPrice extends ProfileProtected {
	price: Price
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

export type Category = Database["public"]["Tables"]["scripts_categories"]["Row"]
export type SubCategory = Database["public"]["Tables"]["scripts_subcategories"]["Row"]

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

export type ScriptPublic = Database["public"]["Tables"]["scripts_public"]["Row"]
export type ScriptProtected = Database["public"]["Tables"]["scripts_protected"]["Row"]
export interface ScriptsProtectedWithUsername extends ScriptProtected, ProfilePublicUsername {}

export type ScriptStats = Database["public"]["Tables"]["stats_scripts"]["Row"]

export interface IScriptCard extends ScriptPublic {
	scripts_protected: ScriptsProtectedWithUsername
}

export interface Script extends IScriptCard {
	stats_scripts: ScriptStats
}
