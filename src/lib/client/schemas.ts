import { z } from "zod"
import { ACCEPTED_IMAGE_TYPES, MB_SIZE, scriptCategories } from "$lib/utils"
import { checkClientImageDimensions } from "$lib/client/utils"
import type { TScriptCategories } from "$lib/types/collection"

const title = z
	.string()
	.min(4, "Must be more than 3 characters long.")
	.max(31, "Must be less than 31 characters long.")

const description = z
	.string()
	.min(10, "Must be more than 9 characters long.")
	.max(160, "Must be less than 160 characters long.")
	.includes(" ", { message: "You have no spaces, this is supposed to be a sentence." })

const content = z
	.string()
	.refine((str) => str === null || str === "" || str.length >= 10, {
		message: "Must be at least 10 characters long"
	})
	.refine((str) => str === null || str === "" || str.includes(" "), {
		message:
			"You have no spaces, this is supposed to be at least a couple of words, ideally a few sentences."
	})

const categoryKeys = Object.keys(scriptCategories) as TScriptCategories
const ScriptCategoryEnum = z.enum(categoryKeys as [TScriptCategories[number], ...TScriptCategories])

export const baseScriptSchema = z.object({
	title: title,
	description: description,
	content: content,
	status: z.boolean().default(false),
	type: z.boolean().default(false),
	categories: z.array(ScriptCategoryEnum).min(1, "You should have at least 1 category."),
	published: z.boolean().default(true),
	xp_min: z
		.number()
		.int("Only whole numbers are allowed.")
		.gte(0, "There's no way to lose experience in OSRS."),
	xp_max: z
		.number()
		.int("Only whole numbers are allowed.")
		.max(60000, "That exceeds the reasonable limit."),
	gp_min: z
		.number()
		.int("Only whole numbers are allowed.")
		.gte(-200000, "That exceeds the reasonable loss limit."),
	gp_max: z
		.number()
		.int("Only whole numbers are allowed.")
		.max(600000, "That exceeds the reasonable profit limit.")
})

export const coverImage = z
	.instanceof(File, { message: "Please upload a file." })
	.refine((file) => file.size <= 3 * MB_SIZE, "Max image size is 3MB.")
	.refine((file) => ACCEPTED_IMAGE_TYPES.includes(file.type), "Only .jpg formats are allwoed.")

export const bannerImage = z
	.instanceof(File, { message: "Please upload a file." })
	.refine((file) => file.size <= 5 * MB_SIZE, "Max image size is 5MB.")
	.refine((file) => ACCEPTED_IMAGE_TYPES.includes(file.type), "Only .jpg formats are allowed.")

export const scriptFile = z
	.instanceof(File, { message: "Please upload a file." })
	.refine((file) => file.size <= 5 * MB_SIZE, "Max script size is 5MB.")
	.refine((file) => file.name.endsWith(".simba"), "Only .simba files are allowed.")

export const addScriptClientSchema = baseScriptSchema
	.extend({
		cover: coverImage.refine(
			async (file) => await checkClientImageDimensions(file, 300, 200),
			"The image must be 300 by 200 pixels."
		),
		banner: bannerImage.refine(
			async (file) => await checkClientImageDimensions(file, 1920, 768),
			"The image must be 1920 by 768 pixels."
		),
		script: scriptFile
	})
	.refine(
		(schema) => schema.xp_min <= schema.xp_max,
		"Minimum experience cannot exceed the maximum experience."
	)
	.refine(
		(schema) => schema.gp_min <= schema.gp_max,
		"Minimum gold cannot exceed the maximum gold."
	)

export type AddScriptSchema = z.infer<typeof addScriptClientSchema>

export const updateScriptClientSchema = baseScriptSchema
	.extend({
		cover: coverImage
			.refine(
				async (file) => await checkClientImageDimensions(file, 300, 200),
				"The image must be 300 by 200 pixels."
			)
			.optional(),
		banner: bannerImage
			.refine(
				async (file) => await checkClientImageDimensions(file, 1920, 768),
				"The image must be 1920 by 768 pixels."
			)
			.optional(),
		script: scriptFile.optional()
	})
	.refine(
		(schema) => schema.xp_min <= schema.xp_max,
		"Minimum experience cannot exceed the maximum experience."
	)
	.refine(
		(schema) => schema.gp_min <= schema.gp_max,
		"Minimum gold cannot exceed the maximum gold."
	)

export type UpdateScriptSchema = z.infer<typeof updateScriptClientSchema>

export const postSchema = z.object({
	title: title,
	description: description,
	content: content,
	level: z
		.number()
		.int("Level has to be between 0 and 2")
		.min(0, "Level has to be positive.")
		.max(2, "Level has to be less than 3."),
	order: z
		.number()
		.int("Order has to be a whole number.")
		.min(0, "Order has to be positive.")
		.max(1000, "Order has to be less than 1000."),
	published: z.boolean()
})

export const legalSchema = z.object({
	content: content
})

export const profileSchema = z.object({
	email: z.string().email("Must be a valid email!").optional(),
	password: z
		.string()
		.min(6, "Must be more than 6 characters long.")
		.max(32, "Must be less than 32 characters long.")
		.optional()
})

export const scripterSchema = z.object({
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
	content: content.nullable()
})

export const subscriptionsSchema = z.object({
	subscriptions: z.array(
		z.object({
			subscription: z.string().min(6, "ID is too short").startsWith("sub_"),
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

const bundledScriptArray = z
	.array(bundledScriptSchema)
	.min(2, "A bundle must have at least 2 scripts!")
	.refine(
		(scripts) => scripts.filter((script) => script.active).length > 1,
		"A bundle must have at least 2 active scripts!"
	)

const bundleSchema = z.object({
	id: z.string().startsWith("prod_"),
	name: z.string(),
	user_id: z.string(),
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
	bundledScripts: bundledScriptArray,
	active: z.boolean()
})

export const bundleArraySchema = z.object({
	bundles: z.array(bundleSchema)
})

export const newBundleSchema = z.object({
	name: z.string().min(3, "Your name is too short."),
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
	bundledScripts: bundledScriptArray,
	open: z.boolean()
})

const premiumScriptSchema = z.object({
	id: z.string().startsWith("prod_"),
	script: z.string().uuid("Script IDs must be valid UUIDs"),
	user_id: z.string().uuid("User id must be a valid UUID"),
	name: z.string(),
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
		}, "Script prices are not in order"),
	subsOpen: z.boolean(),
	freeOpen: z.boolean()
})

export const scriptArraySchema = z.object({
	scripts: z.array(premiumScriptSchema).min(1)
})

export const newScriptSchema = z.object({
	id: z.string().uuid("Script ID must be a valid UUID"),
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
		}, "New script prices are not in order")
})

export const countryCodeSchema = z.object({
	code: z.string().length(2, "Country codes have to be only 2 letters")
})

export const dbaSchema = z.object({
	dba: z.string().min(3, "Your name needs to be longer")
})

export const loginAsSchema = z.object({
	refresh_token: z.string().min(2, "A refresh token should be longer.")
})

export type PriceSchema = z.infer<typeof priceSchema>
export type BundleSchema = z.infer<typeof newBundleSchema>
export type NewScriptSchema = z.infer<typeof newScriptSchema>
