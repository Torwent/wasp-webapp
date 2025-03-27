import {
	bundleArraySchema,
	newBundleSchema,
	newScriptArraySchema,
	scriptArraySchema
} from "$lib/client/schemas"
import { UUID_V4_REGEX } from "$lib/utils"
import { error } from "@sveltejs/kit"
import { superValidate } from "sveltekit-superforms/server"
import { zod } from "sveltekit-superforms/adapters"

export const load = async ({ params: { slug }, locals: { user, getRoles }, depends }) => {
	if (!user) error(403, "You need to be logged in.")
	if (!UUID_V4_REGEX.test(slug)) error(403, "Invalid dashboard UUID.")

	if (user.id !== slug) {
		const roles = await getRoles()
		if (!roles?.administrator) error(403, "You cannot access another scripter dashboard.")
	}

	const promises = await Promise.all([
		superValidate(zod(bundleArraySchema)),
		superValidate(zod(newBundleSchema)),
		superValidate(zod(scriptArraySchema)),
		superValidate(zod(newScriptArraySchema))
	])

	depends("dashboard:stripe_session")

	return {
		forms: {
			bundles: promises[0],
			newBundle: promises[1],
			scripts: promises[2],
			newScript: promises[3]
		}
	}
}
