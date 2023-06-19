import { redirect } from "@sveltejs/kit"

export const load = async ({ data }) => {
	if (!data) throw redirect(300, "./")
	const { form } = data

	return { form }
}
