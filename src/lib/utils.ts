import { type AuthError, type PostgrestError } from "@supabase/supabase-js"

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
		message += "<h3>Authentication Error</h3>"
		message += "<p>Error: " + authErr.name + "</p>"
		message += "<p>Code: " + authErr.code + "</p>"
		message += "<p>Status: " + authErr.status + "</p>"
		message += "<p>Message: " + authErr.message + "</p>"

		if (authErr.cause) message += "<p>Cause: " + authErr.cause + "</p>"
		if (authErr.stack) message += "<p>Stack: " + authErr.stack + "</p>"
	} else if (pgErr.details) {
		message += "<h3>Database Error</h3>"
		message += "<p>Code: " + pgErr.code + "</p>"
		message += "<p>Details: " + pgErr.details + "</p>"
		message += "<p>Message: " + pgErr.message + "</p>"
		message += "<p>Hint: " + pgErr.hint + "</p>"
	}

	return message
}

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
