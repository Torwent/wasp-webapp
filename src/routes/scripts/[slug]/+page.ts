export const load = async ({ data: { dismissed }, parent }) => {
	const { profile } = await parent()
	return { dismissed: profile ? profile.profiles_private.dismissed_warning : dismissed }
}
