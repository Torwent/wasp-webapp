import { getProfile } from "$lib/stores/authStore"
import type { Load } from "@sveltejs/kit"
import { loadError } from "$lib/utils"

export const load: Load = async ({ params, data }) => {
	const { slug } = params
	const user = await getProfile()
	if (user == null) return loadError("user/" + slug)

	const clientAddress = data != null && data.address != null ? data.address : ""

	return { data: user, clientAddress: clientAddress }
}
