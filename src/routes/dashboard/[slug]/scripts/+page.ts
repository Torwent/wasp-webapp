import { error } from "@sveltejs/kit"

export const load = async ({ parent }) => {
	const data = await parent()
	if (!data.scripter.stripe)
		error(
			403,
			"To use this section of the dashboard you need to go through and finish the stripe on-boarding."
		)
}
