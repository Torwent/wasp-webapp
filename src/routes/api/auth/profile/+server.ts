export const GET = async ({ locals: { getProfile } }) => {
	await getProfile()
	return new Response()
}
