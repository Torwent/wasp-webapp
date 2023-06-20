import { redirect } from "@sveltejs/kit"

export const GET = async ({ url, locals: { supabaseServer } }) => {
	console.log("Attempting login")
	const code = url.searchParams.get("code")
	if (code) await supabaseServer.auth.exchangeCodeForSession(code)
	throw redirect(303, "/")
}
