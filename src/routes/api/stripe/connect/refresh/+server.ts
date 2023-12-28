import { redirect } from "@sveltejs/kit"

export const GET = async () => {
	console.log("GET Page refreshed!")
	throw redirect(303, "/dashboard")
}

export const POST = async () => {
	console.log("POST Page refreshed!")
	throw redirect(303, "/dashboard")
}
