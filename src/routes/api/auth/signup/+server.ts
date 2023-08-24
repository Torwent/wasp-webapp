export const POST = async ({ request }) => {
	const req = await request.json()
	console.log("POST => supabase subscriptions webhook: ", req)
	return new Response()
}
