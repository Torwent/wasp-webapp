import { profile, updateProfile } from "$lib/stores/authStore"
import type { Load } from "@sveltejs/kit"
import { loadError } from "$lib/utils"
import { get } from "svelte/store"

export const load: Load = async ({ params, data }) => {
	const { slug } = params
	await updateProfile()
	const user = get(profile)

	if (!user) throw loadError("user/" + slug)

	const clientAddress = data != null && data.address != null ? data.address : ""

	return { data: user, clientAddress: clientAddress }
}
