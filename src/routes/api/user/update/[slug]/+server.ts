import { SERVICE_USER, SERVICE_PASS } from "$env/static/private"
import { json } from "@sveltejs/kit"
import type { RequestHandler } from "@sveltejs/kit"
import WebSocket from "ws"
import { getData, supabase } from "$lib/database/supabase"

export const updateRoles = async (
	id: string,
	d: boolean,
	t: boolean,
	p: boolean,
	v: boolean,
	m: boolean,
	a: boolean
) => {
	if (supabase.auth.user() == null)
		await supabase.auth.signIn({
			email: SERVICE_USER,
			password: SERVICE_PASS
		})

	const { error } = await supabase
		.from("profiles_protected")
		.update({ developer: d, tester: t, premium: p, vip: v, moderator: m, administrator: a })
		.eq("id", id)

	if (error) console.log(error)
}

export const POST: RequestHandler = async ({ params }: any) => {
	const { slug } = params
	if (slug == null) return json("Missing id")

	const data = await getData("profiles_public", slug)
	if (data == null) return json("Profile doesn't exist")

	const url = import.meta.env.VITE_DEV ? "wss://waspscripts.com/wss" : "ws://wasp-discord:4100"
	const ws = new WebSocket(url)

	const profile = data[0]

	ws.addEventListener("open", async () => {
		console.log("Connection open to wasp-discord!")
		if (profile.discord_id !== "") ws.send(profile.discord_id)
	})

	ws.addEventListener("message", async ({ data }: any) => {
		console.log("Received a reply from wasp-discord!")

		const d = data.includes("864744526894333963")
		const t = data.includes("907209408860291113")
		const p = data.includes("820985772140134440")
		const v = data.includes("931167526681972746")
		const m = data.includes("1018906735123124315")
		const a = data.includes("816271648118013953")

		await updateRoles(profile.id, d, t, p, v, m, a)
		ws.close()
	})

	ws.addEventListener("close", async () => {
		console.log("Connection to wasp-discord closed!")
	})

	return json("")
}
