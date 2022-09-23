import { json } from "@sveltejs/kit"
import type { RequestHandler } from "@sveltejs/kit"
import { updateRoles } from "$lib/stores/authStore"
import WebSocket from "ws"
import { getData } from "$lib/database/supabase"

const ws = new WebSocket("ws://wasp-discord:4100")

export const GET: RequestHandler = async ({ params }) => {
	const { slug } = params
	if (slug == null) return json("Missing id")

	const data = await getData("profile", slug)
	if (data == null) return json("Profile doesn't exist")

	const profile = data[0]

	ws.addEventListener("open", () => {
		console.log("Connection open to wasp-discord!")
		if (profile.discord_id !== "") ws.send(profile.discord_id)
	})

	ws.addEventListener("message", async ({ data }) => {
		console.log("Received a reply from wasp-discord!")

		let hasDev = data.includes("864744526894333963")
		let hasPremium = data.includes("820985772140134440")
		let hasVip = data.includes("931167526681972746")
		let hasTester = data.includes("907209408860291113")

		updateRoles(profile.id, hasDev, hasTester, hasPremium, hasVip)
		console.log("Closing the connection to wasp-discord...")
		ws.close()
	})

	ws.addEventListener("close", () => {
		console.log("Connection to wasp-discord closed!")
		return json("User: " + profile.id + " was refreshed!")
	})

	return json("")
}
