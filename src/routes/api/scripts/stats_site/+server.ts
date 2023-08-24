import { PRIVATE_DISCORD_WEBHOOK } from "$env/static/private"
import { redirect } from "@sveltejs/kit"

export const POST = async ({ request }) => {
	console.log(request.headers)
	const req = await request.json()
	console.log("POST => supabase scripts webhook: ", req)

	if (req.type !== "UPDATE" || req.schema !== "scripts" || req.table !== "stats_site")
		return new Response()

	const {
		record: { id, month_downloads_total, month_reports_total }
	} = req

	if ((Number(month_downloads_total) / 100) * 1 > Number(month_reports_total)) return new Response()

	console.log(id, " ", month_downloads_total, " ", month_reports_total)

	fetch(PRIVATE_DISCORD_WEBHOOK, {
		body: `Script with id: ${id} was reported broken by ${month_reports_total} out of ${month_downloads_total}. Please <@907209408860291113> test the script, if it works please clear the reports.
		https://waspscripts.com/scripts/${id}`
	})
	throw redirect(303, "/")
}
