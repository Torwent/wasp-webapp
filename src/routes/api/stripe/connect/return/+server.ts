import { redirect } from "@sveltejs/kit"

export const GET = async () => {
	console.log("GET connect success!")
	throw redirect(303, "/dashboard")
}

export const POST = async () => {
	console.log("POST connect success!")
	throw redirect(303, "/dashboard")
}
