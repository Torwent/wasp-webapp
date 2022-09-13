import type { ServerLoad } from "@sveltejs/kit"

export const load: ServerLoad = async ({ getClientAddress }) => {
	const address = getClientAddress()
	return { address }
}
