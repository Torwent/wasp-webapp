import { error, redirect } from "@sveltejs/kit"
import { formatError } from "$lib/utils"

export const GET = async ({ url: { searchParams }, locals: { supabaseServer } }) => {
	console.log("💻 Logging in")
	const err = searchParams.get("error")

	if (err) {
		let message = ""
		message += "<h3>Authentication Error</h3>"
		message += "<p>Error: " + decodeURI(err) + "</p>"

		const description = searchParams.get("error_description")
		if (description) {
			message += "<p>Message: " + decodeURI(description) + "</p>"
			if (description.includes("email"))
				message += "<p>Make sure you have your email linked to discord!</p>"
		}

		error(401, message)
	}

	const code = searchParams.get("code")
	if (code) {
		const { error: err } = await supabaseServer.auth.exchangeCodeForSession(code)
		if (err) error(401, formatError(err))
	}

	redirect(303, "/")
}
