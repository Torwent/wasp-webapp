import { z } from "zod"
import { browser } from "$app/environment"
import { ACCEPTED_IMAGE_TYPES, MB_SIZE } from "$lib/utils"

async function checkClientImageDimensions(file: any, w: number, h: number): Promise<boolean> {
	if (!browser) return false
	if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) return false

	return new Promise((resolve) => {
		const reader = new FileReader()
		const img = new Image()

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
			.max(60000, "That exceeds the reasonable limit."),
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
			.optional()
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
	id: z.string().uuid("ID must be a valid UUID.").optional(),
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
		.max(2, "Level has to be less than 3."),
	order: z
		.number()
		.int("Order has to be a whole number.")
		.min(0, "Order has to be positive.")
		.max(1000, "Order has to be less than 1000.")
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
	id: z.string().uuid("ID must be a valid UUIDv4."),
	realname: z
		.string()
		.min(2, "If your name really has less than 2 characters contact Torwent.")
		.nullable(),
	description: z
		.string()
		.min(6, "Must be more than 6 characters long.")
		.max(32, "Must be less than 32 characters long.")
		.includes(" ", { message: "This should be a sentence or at least a couple of words." })
		.nullable(),
	github: z
		.string()
		.startsWith("https://github.com/", "This should be a github user profile.")
		.nullable(),
	paypal_id: z
		.string()
		.length(
			13,
			"The paypal ID seems to have the wrong length. If you put the correct ID please contact Torwent."
		)
		.nullable(),
	content: z.string().includes(" ", { message: "This should be a couple of words." }).nullable()
})

export const subscriptionsSchema = z.object({
	subscriptions: z.array(
		z.object({
			cancel: z.boolean()
		})
	)
})

export const priceSchema = z.object({
	id: z.string().startsWith("price_"),
	amount: z
		.number()
		.gte(0, "Amount has to be a positive value.")
		.lte(20000, "Amount can't be more than 200€."),
	interval: z.string().min(4).max(5).regex(new RegExp("week|month|year")),
	currency: z.string().length(3).regex(new RegExp("eur")),
	active: z.boolean()
})

const intervals = ["week", "month", "year"]

const productSchema = z.object({
	id: z.string().startsWith("prod_"),
	prices: z
		.array(priceSchema)
		.min(1, "You need to pass at least 1 price!")
		.max(3, "You passed more than 3 prices!")
		.refine((prices) => {
			prices.sort((priceA, priceB) => {
				return (
					intervals.findIndex((p) => p === priceA.interval) -
					intervals.findIndex((p) => p === priceB.interval)
				)
			})

			prices = prices.filter((prices) => prices.amount > 0)

			for (let i = 0; i < prices.length - 1; i++) {
				if (prices[i].amount >= prices[i + 1].amount) return false
			}
			return true
		}, "Prices are not in order")
})

export const checkoutSchema = z.object({
	products: z.array(productSchema)
})

const newPriceSchema = z.object({
	amount: z
		.number()
		.gte(0, "Amount has to be a positive value.")
		.lte(200, "Amount can't be more than 200€."),
	interval: z.string().min(4).max(5).regex(new RegExp("week|month|year")),
	currency: z.string().length(3).regex(new RegExp("eur"))
})

const bundledScriptSchema = z.object({
	id: z.string().uuid("Script IDs must be valid UUIDs"),
	name: z.string(),
	author: z.string(),
	url: z.string().url(),
	active: z.boolean()
})

const bundleSchema = z.object({
	id: z.string().startsWith("prod_"),
	name: z.string(),
	author: z.string(),
	prices: z
		.array(priceSchema)
		.min(1, "You need to pass at least 1 price!")
		.max(3, "You passed more than 3 prices!")
		.refine((prices) => {
			prices.sort((priceA, priceB) => {
				return (
					intervals.findIndex((p) => p === priceA.interval) -
					intervals.findIndex((p) => p === priceB.interval)
				)
			})

			prices = prices.filter((prices) => prices.amount > 0)

			for (let i = 0; i < prices.length - 1; i++) {
				if (prices[i].amount >= prices[i + 1].amount) return false
			}
			return true
		}, "Bundle prices are not in order"),
	bundledScripts: z.array(bundledScriptSchema).min(2, "A bundle must have at least 2 scripts!"),
	open: z.boolean()
})

export const bundleArraySchema = z.object({
	bundles: z.array(bundleSchema)
})

export const newBundleSchema = z.object({
	name: z.string().min(3, "Your name is too short."),
	author: z.string(),
	user_id: z.string(),
	prices: z
		.array(newPriceSchema)
		.min(1, "You need to pass at least 1 price!")
		.max(3, "You passed more than 3 prices!")
		.refine((prices) => {
			prices.sort((priceA, priceB) => {
				return (
					intervals.findIndex((p) => p === priceA.interval) -
					intervals.findIndex((p) => p === priceB.interval)
				)
			})

			prices = prices.filter((prices) => prices.amount > 0)

			for (let i = 0; i < prices.length - 1; i++) {
				if (prices[i].amount >= prices[i + 1].amount) return false
			}
			return true
		}, "New bundle prices are not in order"),
	bundledScripts: z.array(bundledScriptSchema).min(2, "A bundle must have at least 2 scripts!"),
	open: z.boolean()
})

const premiumScriptSchema = z.object({
	id: z.string().startsWith("prod_"),
	script: z.string().uuid("Script IDs must be valid UUIDs"),
	user_id: z.string().uuid("User id must be a valid UUID"),
	name: z.string(),
	author: z.string(),
	url: z.string().url(),
	prices: z
		.array(priceSchema)
		.min(1, "You need to pass at least 1 price!")
		.max(3, "You passed more than 3 prices!")
		.refine((prices) => {
			prices.sort((priceA, priceB) => {
				return (
					intervals.findIndex((p) => p === priceA.interval) -
					intervals.findIndex((p) => p === priceB.interval)
				)
			})

			prices = prices.filter((prices) => prices.amount > 0)

			for (let i = 0; i < prices.length - 1; i++) {
				if (prices[i].amount >= prices[i + 1].amount) return false
			}
			return true
		}, "Script prices are not in order")
})

export const scriptArraySchema = z.object({
	scripts: z.array(premiumScriptSchema).min(1)
})

export const newScriptSchema = z.object({
	id: z.string().uuid("Script ID must be a valid UUID"),
	name: z.string().min(3, "Your name is too short."),
	author: z.string(),
	url: z.string().url(),
	prices: z
		.array(newPriceSchema)
		.min(1, "You need to pass at least 1 price!")
		.max(3, "You passed more than 3 prices!")
		.refine((prices) => {
			prices.sort((priceA, priceB) => {
				return (
					intervals.findIndex((p) => p === priceA.interval) -
					intervals.findIndex((p) => p === priceB.interval)
				)
			})

			prices = prices.filter((prices) => prices.amount > 0)

			for (let i = 0; i < prices.length - 1; i++) {
				if (prices[i].amount >= prices[i + 1].amount) return false
			}
			return true
		}, "New script prices are not in order")
})

export const newScriptArraySchema = z.object({
	scripts: z.array(newScriptSchema)
})

export const countryCodeSchema = z.object({
	code: z.string().length(2, "Country codes have to be only 2 letters")
})

export const dbaSchema = z.object({
	dba: z.string().min(3, "Your name needs to be longer")
})

export type PriceSchema = z.infer<typeof priceSchema>
export type BundleSchema = z.infer<typeof newBundleSchema>
export type NewScriptSchema = z.infer<typeof newScriptSchema>

export type BundleArraySchema = typeof bundleArraySchema
export type NewBundleSchema = typeof newBundleSchema
export type ScriptArraySchema = typeof scriptArraySchema
export type NewScriptArraySchema = typeof newScriptArraySchema
