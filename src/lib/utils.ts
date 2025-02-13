import type { AuthError, PostgrestError } from "@supabase/supabase-js"
import type { Price } from "./types/collection"

export const API_URL = "https://api.waspscripts.com" //http://localhost:8080
export const UUID_V4_REGEX =
	/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[4][0-9a-fA-F]{3}-[89AB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/i

export const MB_SIZE = 1000000
export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg"]

export const profileQuery = `id, discord, username, avatar, customer_id,
							 private (email, warning),
							 roles (banned, premium, vip, tester, scripter, moderator, administrator),
							 subscription (subscription, product, price, date_start, date_end, cancel, disabled),
							 free_access (id, product, date_start, date_end)`

export function formatError(err: AuthError): string
export function formatError(err: PostgrestError): string
export function formatError(err: AuthError | PostgrestError) {
	console.error(err)
	let message = ""
	const authErr = err as AuthError
	const pgErr = err as PostgrestError

	if (authErr.name) {
		message += "Authentication Error\n\n"
		message += "Error   : " + authErr.name + "\n"
		message += "Code    : " + authErr.code + "\n"
		message += "Status  : " + authErr.status + "\n"
		message += "Message : " + authErr.message + "\n"
		message += authErr.cause ? "Cause   : " + authErr.cause + "\n" : ""
		message += authErr.stack ? "Stack   : " + authErr.stack + "\n" : ""
	} else if (pgErr.details) {
		message += "Database Error\n\n"
		message += "Code    : " + pgErr.code + "\n"
		message += "Details : " + pgErr.details + "\n"
		message += "Message : " + pgErr.message + "\n"
		message += "Hint    : " + pgErr.hint + "\n"
	}

	return message
}

//String
export function formatTime(t: number): string {
	let result = ""

	const total_seconds = Math.floor(t / 1000)
	const total_minutes = Math.floor(total_seconds / 60)
	const total_hours = Math.floor(total_minutes / 60)
	const total_days = Math.floor(total_hours / 24)

	const years = Math.floor(total_days / 365)

	const seconds = total_seconds % 60
	const minutes = total_minutes % 60
	const hours = total_hours % 24
	const days = total_days % 365

	if (years > 0) result += years.toString() + "y "
	if (days > 0) result += days.toString() + "d "
	if (hours > 0) result += hours.toString() + "h "
	if (minutes > 0) result += minutes.toString() + "m"

	if (days === 0 && seconds > 0) result += " " + seconds.toString() + "s"

	return result
}

export function formatNumber(n: number): string {
	let i = 0
	let f: number = n
	const arr: string[] = ["", "K", "M", "B", "T"]

	while (Math.abs(f) >= 1000) {
		i++
		f = f / 1000
	}

	return parseFloat(f.toFixed(2)).toString() + " " + arr[i]
}

export function encodeSEO(url: string) {
	url = encodeURI(url.toLocaleLowerCase())
		.replaceAll("%20", "-")
		.replace(/&/g, "-and-")
		.replace(/[^a-z-]/g, "")
		.replace(/-+/g, "-")
		.replace(/^-*/, "")
		.replace(/-*$/, "")
	return url
}

export function cropString(str: string, length = 80) {
	if (str.length > length) {
		str = str.substring(0, length) + "..."
	}

	return str
}

//Prices
export function getActivePrice(prices: Price[]) {
	return prices.find((price) => price.active)
}

export function getPriceAmount(price: Price) {
	return new Intl.NumberFormat("pt-PT", {
		style: "currency",
		currency: price.currency
	}).format(price.amount / 100)
}

export function getCurrentPrice(prices: Price[]) {
	const price = getActivePrice(prices)
	if (price) return getPriceAmount(price)
}

export function getPrice(id: string, prices: Price[]) {
	return prices.find((price) => price.id === id)
}

export function getPriceInterval(interval: string) {
	return interval.slice(0)[0].toUpperCase() + interval.slice(1) + "ly"
}

export function getPriceIntervalEx(price: Price) {
	return getPriceInterval(price.interval)
}

export function setPriceInterval(index: number, prices: Price[]) {
	for (let i = 0; i < prices.length; i++) prices[i].active = false
	prices[index].active = true
}

export const scriptDefaultContent = `### {$title} by {$author}

Script ID: {$id}

Latest revision: {$revision}

Updated at: {$last_revision_full_date}

Date updated at: {$revision_date}

Time of update: {$last_revision_time}

{$description}

Can get {$min_xp}-{$max_xp} xp/h and {$min_gp}-{$max_gp} gp/h.

#### Required Setup:
- Item A visible in bank
- Item B visible in bank

#### Features:
- Does this cool task
- Supports X method
- Supports Y method

#### Known Issues:
- Buggy at doing Z.

#### Additional information:
You need quest ABC completed to use this.
`

export const scriptStatus = {
	official: { name: "Official", value: "official", icon: "🏷️" },
	community: { name: "community", value: "community", icon: "🚀" }
}

export const scriptTypes = {
	premium: { name: "Premium", value: "premium", icon: "👑" },
	free: { name: "Free", value: "free", icon: "🎈" }
}

export const scriptCategories = {
	combat: { name: "Combat", value: "combat", icon: "⚔" },
	magic: { name: "Magic", value: "magic", icon: "✨" },
	prayer: { name: "Prayer", value: "prayer", icon: "🌟" },
	hitpoints: { name: "Hitpoints", value: "hitpoints", icon: "❤️" },
	mining: { name: "Mining", value: "mining", icon: "⛏️" },
	fishing: { name: "Fishing", value: "fishing", icon: "🎣" },
	woodcutting: { name: "Woodcutting", value: "woodcutting", icon: "🪓" },
	hunter: { name: "Hunter", value: "hunter", icon: "🐾" },
	farming: { name: "Farming", value: "farming", icon: "🌱" },
	cooking: { name: "Cooking", value: "cooking", icon: "🍳" },
	smithing: { name: "Smithing", value: "smithing", icon: "🔨" },
	fletching: { name: "Fletching", value: "fletching", icon: "🥢" },
	firemaking: { name: "Firemaking", value: "firemaking", icon: "🔥" },
	herblore: { name: "Herblore", value: "herblore", icon: "🌿" },
	crafting: { name: "Crafting", value: "crafting", icon: "⚒" },
	construction: { name: "Construction", value: "construction", icon: "🧰" },
	agility: { name: "Agility", value: "agility", icon: "🏃" },
	slayer: { name: "Slayer", value: "slayer", icon: "💀" },
	thieving: { name: "Thieving", value: "thieving", icon: "🦝" },
	runecrafting: { name: "Runecrafting", value: "runecrafting", icon: "⚡" },
	tool: { name: "Tool", value: "tool", icon: "🪛" },
	minigame: { name: "Minigame", value: "minigame", icon: "🎲" },
	moneymaker: { name: "Money Maker", value: "moneymaker", icon: "💰" },
	boss: { name: "Boss", value: "boss", icon: "👹" }
}
