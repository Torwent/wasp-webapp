import { z } from "zod"
import { browser } from "$app/environment"

interface ProfilePublic {
	id: string
	discord_id: string
	username: string
	avatar_url: string
}

interface ProfileProtected {
	developer: boolean
	premium: boolean
	vip: boolean
	tester: boolean
	scripter: boolean
	moderator: boolean
	administrator: boolean
}

interface ProfilePrivate {
	dismissed_warning: boolean
}

export interface Profile extends ProfilePublic {
	profiles_protected: ProfileProtected
	profiles_private: ProfilePrivate
}

export interface Developer {
	id?: string
	realname: string
	username: string
	description: string
	content: string
	github: string
	paypal_id: string
}

export interface Category {
	name: string
	emoji: string
}

export interface SubCategory extends Category {
	category: string
}

export interface FAQEntry {
	id: number
	title: string
	content: string
}

export interface Stat {
	username: string
	experience: number
	gold: number
	levels: number
	runtime: number
}

export interface EmojiTooltip {
	icon: string
	tooltip: string
}

export interface ScriptPublic {
	id?: string
	title: string
	description: string
	content: string
	categories: string[]
	subcategories: string[]
	published: true | false
	min_xp: number
	max_xp: number
	min_gp: number
	max_gp: number
	emojiTooltips?: EmojiTooltip[]
}

interface ScriptProtected {
	author: string
	assets_path: string
	author_id: string
	assets_alt: string
	revision: number
}

interface ScriptStats {
	experience: number
	gold: number
	levels: number
	runtime: number
	total_unique_users: number
	total_current_users: number
	total_monthly_users: number
}

export interface IScriptCard extends ScriptPublic {
	scripts_protected: ScriptProtected
}

export interface Script extends ScriptPublic {
	scripts_protected: ScriptProtected
	stats_scripts: ScriptStats
}

export interface PostStatic {
	id: number
	user_id: string
	author: string
}

export interface PostData {
	title: string
	description: string
	content: string
	level: number
}

export interface Post extends PostStatic, PostData {}

export interface CheckboxType {
	id: number
	name: string
	emoji: string
	main: boolean
	checked: boolean
}

const MB_SIZE = 100000
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg"]

async function checkClientImageDimensions(file: any, w: number, h: number): Promise<boolean> {
	if (!browser) return false
	if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) return false

	return new Promise((resolve) => {
		let reader = new FileReader()
		let img = new Image()

		reader.onload = function () {
			img.src = reader.result as string
		}
		img.onload = function () {
			resolve(img.width === w && img.height === h)
		}

		reader.readAsDataURL(file)
	})
}

export const scriptSchema = z
	.object({
		id: z.string().uuid("ID must be a valid UUIDv4").optional(),
		title: z
			.string()
			.min(4, "Must be more than 3 characters long.")
			.max(46, "Must be less than 47 characters long."),
		description: z
			.string()
			.min(10, "Must be more than 9 characters long.")
			.max(160, "Must be less than 160 characters long.")
			.includes(" ", { message: "You have no spaces, this is supposed to be a sentence." }),
		content: z
			.string()
			.min(10)
			.includes(" ", { message: "You have no spaces, this is supposed to be a sentence." }),
		categories: z
			.array(z.string())
			.min(3, "You should have at least 3 categories.")
			.refine(
				(categories) => categories.includes("Official") || categories.includes("Community"),
				"Scripts need to have either 🎫Official or 🚀Community category."
			)
			.refine(
				(categories) => !categories.includes("Official") || !categories.includes("Community"),
				"Scripts can't have both 🎫Official and 🚀Community categories."
			)
			.refine(
				(categories) => categories.includes("Free") || categories.includes("Premium"),
				"Scripts need to have either 🎈Free or 👑Premium category."
			)
			.refine(
				(categories) => !categories.includes("Free") || !categories.includes("Premium"),
				"Scripts can't have both 🎈Free and 👑Premium categories."
			),
		subcategories: z.array(z.string()).min(1, "You should have at least 1 subcategory."),
		min_xp: z
			.number()
			.int("Only whole numbers are allowed.")
			.gte(0, "There's no way to lose experience in OSRS."),
		max_xp: z
			.number()
			.int("Only whole numbers are allowed.")
			.max(40000, "That exceeds the reasonable limit."),
		min_gp: z
			.number()
			.int("Only whole numbers are allowed.")
			.gte(-200000, "That exceeds the reasonable loss limit."),
		max_gp: z
			.number()
			.int("Only whole numbers are allowed.")
			.max(250000, "That exceeds the reasonable profit limit."),
		cover: z
			.any()
			.refine((file) => file.size <= 3 * MB_SIZE, "Max image size is 3MB.")
			.refine((file) => ACCEPTED_IMAGE_TYPES.includes(file.type), "Only .jpg formats are allwoed.")
			.refine(
				async (file) => await checkClientImageDimensions(file, 300, 200),
				"The image must be 300 by 200 pixels."
			)
			.optional(),

		banner: z
			.any()
			.refine((file) => file.size <= 5 * MB_SIZE, "Max image size is 5MB.")
			.refine((file) => ACCEPTED_IMAGE_TYPES.includes(file.type), "Only .jpg formats are allowed.")
			.refine(
				async (file) => await checkClientImageDimensions(file, 1920, 768),
				"The image must be 1920 by 768 pixels."
			)
			.optional(),

		script: z
			.any()
			.refine((file) => file.size <= 2 * MB_SIZE, `Max script size is 2MB.`)
			.refine((file) => file.name.endsWith(".simba"), "Only .simba files are allowed.")
			.optional(),
		published: z.boolean().optional()
	})
	.refine(
		(schema) => schema.min_xp <= schema.max_xp,
		"Minimum experience cannot exceed the maximum experience."
	)
	.refine(
		(schema) => schema.min_gp <= schema.max_gp,
		"Minimum gold cannot exceed the maximum gold."
	)

export const postSchema = z.object({
	id: z.number().int("ID must be greater than 0.").optional(),
	title: z
		.string()
		.min(4, "Must be more than 3 characters long.")
		.max(46, "Must be less than 47 characters long."),
	description: z
		.string()
		.min(10, "Must be more than 9 characters long.")
		.max(160, "Must be less than 160 characters long.")
		.includes(" ", { message: "You have no spaces, this is supposed to be a sentence." }),
	content: z
		.string()
		.min(10)
		.includes(" ", { message: "You have no spaces, this is supposed to be a sentence." }),
	level: z
		.number()
		.int("Level has to be between 0 and 2")
		.min(0, "Level has to be positive.")
		.max(2, "Level has to be less than 3.")
})

export const profileSchema = z.object({
	email: z.string().email("Must be a valid email!").optional(),
	password: z
		.string()
		.min(6, "Must be more than 6 characters long.")
		.max(32, "Must be less than 32 characters long.")
		.optional()
})

export const developerSchema = z.object({
	id: z.string().uuid("ID must be a valid UUIDv4.").optional(),
	realname: z
		.string()
		.min(2, "If your name really has less than 2 characters contact Torwent.")
		.optional(),
	username: z.string().min(3, "That username is too short!").max(16, "That username is too large!"),
	description: z
		.string()
		.min(6, "Must be more than 6 characters long.")
		.max(32, "Must be less than 32 characters long.")
		.includes(" ", { message: "This should be a sentence or at least a couple of words." }),
	github: z.string().startsWith("https://github.com/", "This should be a github user profile."),
	paypal_id: z
		.string()
		.length(
			13,
			"The paypal ID seems to have the wrong length. If you put the correct ID please contact Torwent."
		)
		.optional(),
	content: z.string().includes(" ", { message: "This should be a couple of words." })
})
