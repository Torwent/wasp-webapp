import { ADMIN_PASS, PRIVATE_DISCORD_WEBHOOK } from "$env/static/private"

export const POST = async ({ fetch, request }) => {
	const hookPassword = request.headers.get("password")
	const req = await request.json()

	if (hookPassword !== ADMIN_PASS) {
		console.error("Webhook password doesn't match")
		throw Error("Webhook password doesn't match")
	}
	if (req.type !== "INSERT" || req.schema !== "profiles" || req.table !== "subscriptions") {
		console.error("Webhook sent doesn't match this endpoint.")
		throw Error("Webhook sent doesn't match this endpoint.")
	}

	const {
		record: { id, month_downloads_total, month_reports_total }
	} = req

	if ((Number(month_downloads_total) / 100) * 1 > Number(month_reports_total)) return new Response()

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
					" downloads.\n\nPlease <@&907209408860291113> test the script, if it works please clear the reports.\n\nhttps://waspscripts.com/scripts/SCRIPT_ID_HERE",

				footer: { text: "Please clear the reports if the script works" }
			}
		]
	}

	await fetch(PRIVATE_DISCORD_WEBHOOK, {
		method: "POST",
		headers: { "Content-type": "application/json" },
		body: JSON.stringify(hook)
	})
	return new Response()
}
