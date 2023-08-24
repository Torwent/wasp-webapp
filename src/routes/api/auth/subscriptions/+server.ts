import { PRIVATE_DISCORD_WEBHOOK } from "$env/static/private"
import { redirect } from "@sveltejs/kit"

export const POST = async ({ request }) => {
	const req = await request.json()
	console.log("POST => supabase webhook: ", req)

	if (req.status !== 200) return new Response()
	if (req.data.table !== "stats_site") return new Response()

	const entry = req.data.record

	const { id, month_downloads_total, month_reports_total } = entry

	if ((Number(month_downloads_total) / 100) * 1 > Number(month_reports_total)) return new Response()

	console.log(id, " ", month_downloads_total, " ", month_reports_total)

	fetch(PRIVATE_DISCORD_WEBHOOK, {
		body: `Script with id: ${id} was reported broken by ${month_reports_total} out of ${month_downloads_total}. Please <@907209408860291113> test the script, if it works please clear the reports.
		https://waspscripts.com/scripts/${id}`
	})
	throw redirect(303, "/")
}
