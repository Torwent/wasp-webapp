import { SUPABASE_WEBHOOK_PASSWORD, DISCORD_WEBHOOK } from "$env/static/private"
import { updateScriptNotification } from "$lib/server/supabase.server"
import { json } from "@sveltejs/kit"

export const POST = async ({ fetch, request }) => {
	const hookPassword = request.headers.get("password")
	const req = await request.json()

	if (hookPassword !== SUPABASE_WEBHOOK_PASSWORD) {
		console.error("Webhook password doesn't match")
		throw Error("Webhook password doesn't match")
	}
	if (req.type !== "UPDATE" || req.schema !== "scripts" || req.table !== "stats_site") {
		console.error("Webhook sent doesn't match this endpoint.")
		throw Error("Webhook sent doesn't match this endpoint.")
	}

	const {
		record: { id, month_downloads_total, month_reports_total, notified }
	} = req

	if (notified) return json({ success: "true" })
	if (Number(month_downloads_total) <= 10) return json({ success: "true" })
	if ((Number(month_downloads_total) / 100) * 5 > Number(month_reports_total))
		return json({ success: "true" })

	console.log("Posting to discord #🧪testers channel")

	const hook = {
		embeds: [
			{
				title: id + " broken",
				url: "https://waspscripts.com/scripts/" + id,
				color: "5763719",
				description:
					"Script with id: " +
					id +
					" was reported broken by " +
					month_reports_total +
					" out of " +
					month_downloads_total +
					" downloads.\n\nPlease <@&907209408860291113> test the script, if it works please clear the reports.\n\nhttps://waspscripts.com/scripts/" +
					id,

				footer: { text: "Please clear the reports if the script works" }
			}
		]
	}

	await Promise.all([
		fetch(DISCORD_WEBHOOK, {
			method: "POST",
			headers: { "Content-type": "application/json" },
			body: JSON.stringify(hook)
		}).catch((err) => console.log(err)),
		updateScriptNotification(id)
	])
	return json({ success: "true" })
}
