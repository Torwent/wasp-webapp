export const load = async ({ data: { dismissed }, parent }) => {
	const { profile } = await parent()
	return { dismissed: profile ? profile.private.warning : dismissed }
}
