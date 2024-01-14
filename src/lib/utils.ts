import type { Price, Script } from "./types/collection"

export const API_URL = "https://api.waspscripts.com" //http://localhost:8080
export const UUID_V4_REGEX =
	/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[4][0-9a-fA-F]{3}-[89AB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/i

export const MB_SIZE = 100000
export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg"]

export const loadError = (page = "") => {
	if (page == null) page = "page"
	return {
		status: 404,
		error: new Error(page + " not found.")
	}
}

export const pad = (n: number, size: number) => {
	let s = n + ""
	while (s.length < size) s = "0" + s
	return s
}

export const search = (content: string, search: string) => {
	content = content.toLowerCase()
	search = search.toLowerCase()
	let i = 0,
		n = -1,
		l: string

	for (; (l = search[i++]); ) {
		if (!~(n = content.indexOf(l, n + 1))) {
			return false
		}
	}
	return true
}

export const validateEmail = (input: string) => {
	return input.match(/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/)
}

export const validateIp = (input: string) => {
	const ipv4 =
		"(([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])\\.){3}([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])"

	const ipv6 = "((([0-9a-fA-F]){1,4})\\:){7}([0-9a-fA-F]){1,4}"

	return input.match(ipv4) || input.match(ipv6)
}

export function convertTime(t: number): string {
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

export function formatRSNumber(n: number): string {
	let i = 0
	let f: number = n
	const arr: string[] = ["", "K", "M", "B", "T"]

	while (Math.abs(f) >= 1000) {
		i++
		f = f / 1000
	}

	return parseFloat(f.toFixed(2)).toString() + " " + arr[i]
}

export function capitalizeString(string: string): string {
	return string.charAt(0).toUpperCase() + string.slice(1)
}

export function randomString() {
	const n = Math.random() + 1
	return n.toString(36).substring(7)
}

export function cropString(str: string, length = 80) {
	if (str.length > length) {
		str = str.substring(0, length) + "..."
	}

	return str
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

export function replaceScriptContent(script: Script) {
	const placeholders: { [key: string]: string } = {
		id: script.id,
		title: script.title,
		description: script.description,
		author: script.protected.username,
		revision: script.protected.revision.toString(),
		revision_full_date: new Date(script.protected.revision_date).toLocaleString("pt-PT"),
		last_revision_full_date: new Date(script.protected.revision_date).toLocaleString("pt-PT"),
		revision_date: new Date(script.protected.revision_date).toLocaleString("pt-PT", {
			day: "2-digit",
			month: "2-digit",
			year: "numeric"
		}),
		last_revision_date: new Date(script.protected.revision_date).toLocaleString("pt-PT", {
			day: "2-digit",
			month: "2-digit",
			year: "numeric"
		}),
		last_revision_time: new Date(script.protected.revision_date).toLocaleString("pt-PT", {
			hour: "2-digit",
			minute: "2-digit",
			second: "2-digit",
			hour12: false
		}),
		revision_time: new Date(script.protected.revision_date).toLocaleString("pt-PT", {
			hour: "2-digit",
			minute: "2-digit",
			second: "2-digit",
			hour12: false
		}),
		min_xp: formatRSNumber(Number(script.min_xp * 12)),
		max_xp: formatRSNumber(Number(script.max_xp * 12)),
		min_gp: formatRSNumber(Number(script.min_gp * 12)),
		max_gp: formatRSNumber(Number(script.max_gp * 12))
	}

	const result = script.content.replace(/\{\$([^{}\s$]+)\}/g, (match, placeholder) => {
		const value = placeholders[placeholder]
		return value !== undefined ? value : match
	})

	return result
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

export function getPriceAmount(price: Price) {
	return new Intl.NumberFormat("pt-PT", {
		style: "currency",
		currency: price.currency
	}).format(price.amount / 100)
}

export function getPrice(id: string, prices: Price[]) {
	return prices.find((price) => price.id === id)
}

export function getActivePrice(prices: Price[]) {
	return prices.find((price) => price.active)
}

export function getCurrentPrice(prices: Price[]) {
	const price = getActivePrice(prices)
	if (price) return getPriceAmount(price)
}

export const profileQuery = `id, discord, username, avatar, customer_id,
							 private!private_id_fkey (email, warning),
							 roles!roles_id_fkey (banned, premium, vip, tester, scripter, moderator, administrator),
							 subscription!subscription_id_fkey (subscription, product, price, date_start, date_end, cancel)`
