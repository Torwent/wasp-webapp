import { browser } from "$app/environment"
import { goto } from "$app/navigation"
import type { Script, ScriptLimits, ScriptPublic } from "$lib/types/collection"
import { ACCEPTED_IMAGE_TYPES, formatNumber } from "$lib/utils"
import { error } from "@sveltejs/kit"

export async function replaceQuery(url: URL, values: Record<string, string>) {
	if (!browser) return

	const { origin, pathname, searchParams } = url
	const currentPath = origin + pathname
	let invalidate = false

	const newSearchParams = new URLSearchParams(searchParams)

	for (const [k, v] of Object.entries(values)) {
		const encodedKey = encodeURIComponent(k)
		if (v) {
			newSearchParams.set(encodedKey, encodeURIComponent(v))
		} else {
			newSearchParams.delete(encodedKey)
			invalidate = true
		}
	}

	const newSearchString = newSearchParams.toString()
	const path = `${currentPath}?${newSearchString}`

	await goto(path, {
		keepFocus: true,
		noScroll: true,
		replaceState: false,
		invalidateAll: invalidate
	})
}

export const pad = (n: number, size: number) => {
	let s = n + ""
	while (s.length < size) s = "0" + s
	return s
}

export function getScriptContent(
	script: ScriptPublic,
	limits: ScriptLimits,
	username: string,
	locale: string = "pt-PT"
) {
	const date: Intl.DateTimeFormatOptions = {
		day: "2-digit",
		month: "2-digit",
		year: "numeric"
	}

	const time: Intl.DateTimeFormatOptions = {
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
		hour12: false
	}

	const placeholders: { [key: string]: string } = {
		id: script.id,
		title: script.title,
		description: script.description,
		author: username,
		revision: "1",
		revision_full_date: new Date(Date.now()).toLocaleString(locale),
		last_revision_full_date: new Date(Date.now()).toLocaleString(locale),
		revision_date: new Date(Date.now()).toLocaleString(locale, date),
		last_revision_date: new Date(Date.now()).toLocaleString(locale, date),
		last_revision_time: new Date(Date.now()).toLocaleString(locale, time),
		revision_time: new Date(Date.now()).toLocaleString(locale, time),
		min_xp: formatNumber(Number(limits.xp_min * 12)),
		max_xp: formatNumber(Number(limits.xp_max * 12)),
		min_gp: formatNumber(Number(limits.gp_min * 12)),
		max_gp: formatNumber(Number(limits.gp_max * 12))
	}

	const result = script.content.replace(/\{\$([^{}\s$]+)\}/g, (match, placeholder) => {
		const value = placeholders[placeholder]
		return value !== undefined ? value : match
	})

	return result
}

export function replaceScriptContent(script: Script, locale: string = "pt-PT") {
	const date: Intl.DateTimeFormatOptions = {
		day: "2-digit",
		month: "2-digit",
		year: "numeric"
	}

	const time: Intl.DateTimeFormatOptions = {
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
		hour12: false
	}

	const placeholders: { [key: string]: string } = {
		id: script.id,
		title: script.title,
		description: script.description,
		author: script.protected.username,
		revision: script.protected.revision.toString(),
		revision_full_date: new Date(script.protected.revision_date).toLocaleString(locale),
		last_revision_full_date: new Date(script.protected.revision_date).toLocaleString(locale),
		revision_date: new Date(script.protected.revision_date).toLocaleString(locale, date),
		last_revision_date: new Date(script.protected.revision_date).toLocaleString(locale, date),
		last_revision_time: new Date(script.protected.revision_date).toLocaleString(locale, time),
		revision_time: new Date(script.protected.revision_date).toLocaleString(locale, time),
		min_xp: formatNumber(Number(script.stats_limits.xp_min * 12)),
		max_xp: formatNumber(Number(script.stats_limits.xp_max * 12)),
		min_gp: formatNumber(Number(script.stats_limits.gp_min * 12)),
		max_gp: formatNumber(Number(script.stats_limits.gp_max * 12))
	}

	const result = script.content.replace(/\{\$([^{}\s$]+)\}/g, (match, placeholder) => {
		const value = placeholders[placeholder]
		return value !== undefined ? value : match
	})

	return result
}

export async function checkClientImageDimensions(
	file: any,
	w: number,
	h: number
): Promise<boolean> {
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

export function streamedErrorHandler(err: { status: number; body: { message: string } }) {
	return new Promise((reject) => {
		setTimeout(() => {
			reject(error(err.status, err?.body?.message))
		}, 500)
	})
}
