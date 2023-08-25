import { PRIVATE_DISCORD_WEBHOOK } from "$env/static/private"

export const POST = async ({ request }) => {
	console.log(request.headers)
	const req = await request.json()

	if (req.type !== "UPDATE" || req.schema !== "scripts" || req.table !== "stats_site")
		return new Response()

	const {
		record: { id, month_downloads_total, month_reports_total }
	} = req

	if ((Number(month_downloads_total) / 100) * 1 > Number(month_reports_total)) return new Response()

	console.log(id, " ", month_downloads_total, " ", month_reports_total)

	const hook = {
		embeds: [
			{
				title: id + " broken",
				url: "https://waspscripts.com/scripts/" + id,
				color: "5763719",
				description:
					"Script with id: " +
					id +
					" was reported broken by X out of Y downloads.\n\nPlease <@&907209408860291113> test the script, if it works please clear the reports.\n\nhttps://waspscripts.com/scripts/SCRIPT_ID_HERE",

				footer: { text: "Please clear the reports if the script works" }
			}
		]
	}

	fetch(PRIVATE_DISCORD_WEBHOOK, {
		method: "POST",
		headers: { "Content-type": "application/json" },
		body: JSON.stringify(hook)
	})
	return new Response()
}
