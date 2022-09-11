export interface Profile {
	username: string
	id: string
	avatar: string
	dev: boolean
	premium: boolean
	vip: boolean
	tester: boolean
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
	user_id?: string
	assets_path?: string
	assets_alt?: string
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
