export interface Profile {
	id: string
	username: string
	discord_id: string
	avatar_url: string
	developer: boolean
	premium: boolean
	vip: boolean
	tester: boolean
	moderator: boolean
	administrator: boolean
	unlocked_ips: number
	dismissed_warning: boolean
}

export interface Developer {
	id: string
	real_name: string
	username: string
	description: string
	content: string
	github: string
	paypal_id: string
}

export interface Script {
	id?: string
	title: string
	description: string
	content: string
	revision: number
	categories: string[]
	subcategories: string[]
	author?: string
	author_id?: string
	assets_path: string
	assets_alt?: string
}

export interface DownloadScript {
	id: string
	title: string
	revision: number
	categories: string[]
}

export interface Post {
	id?: number
	user_id?: string
	title: string
	description: string
	content: string
	level: number
	author: string
}

export interface Category {
	name: string
	emoji: string
}

export interface SubCategory {
	category: string
	name: string
	emoji: string
}

export interface FAQEntry {
	title: string
	content: string
}

export interface Stat {
	biohash: string
	username: string
	experience: number
	gold: number
	levels: number
	runtime: number
	banned: boolean
}
