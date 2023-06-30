import { error, redirect } from "@sveltejs/kit"

export const GET = async ({ url: { searchParams }, locals: { supabaseServer } }) => {
	console.log("Logging in")
	const code = searchParams.get("code")
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

	throw redirect(303, "/")
}
