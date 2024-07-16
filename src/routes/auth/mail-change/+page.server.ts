import { error } from "@sveltejs/kit"

export const load = async ({ url: { searchParams } }) => {
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

	const message = searchParams.get("message")
	if (!message) error(401, "Failed to get the email update server message!")

	return { message }
}
