import type { Handle } from "@sveltejs/kit"

export const handle: Handle = async ({ event, resolve }) => {
	let theme = event.cookies.get("siteTheme")
	if (theme == null) theme = "dark"

	let warning = event.cookies.get("warningDismissed")
	if (warning == null) warning = "false"

	const response = await resolve(event, {
		transformPageChunk: ({ html }) => html.replace('class=""', `class="${theme}"`)
	})
	return response
}
