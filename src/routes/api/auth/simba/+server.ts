import { error, redirect } from "@sveltejs/kit"

export const GET = async ({ url: { searchParams }, locals: { supabaseServer } }) => {
	console.log("Logging in with Simba")

	const code = searchParams.get("code")
	const err = searchParams.get("error")
	if (err) {
		let msg = "Authentication error!\n\n"
		msg += "Error name:" + decodeURI(err) + "\n"
		const description = searchParams.get("error_description")
		if (description) {
			msg += "Error message: " + decodeURI(description) + "\n\n"
			msg += description.includes("email") ? "Make sure you have your email linked to discord!" : ""
		}
		throw error(401, msg)
	}

	if (code) {
		const { error: err } = await supabaseServer.auth.exchangeCodeForSession(code)
		if (err)
			throw error(
				401,
				`Authentication error!
			Error name: ${err.name}
			Error status: ${err.status}
			Error stack: ${err.stack}
			Error cause: ${err.cause}
			Error message: ${err.message}`
			)
	}

	throw redirect(303, "/refresh_token")
}
