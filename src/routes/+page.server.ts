import type { Provider } from "@supabase/supabase-js"
import type { Actions } from "./$types"
import { fail, redirect } from "@sveltejs/kit"

export const actions: Actions = {
	login: async ({ locals, url }) => {
		const provider = url.searchParams.get("provider") as Provider

		if (provider) {
			const { data, error: err } = await locals.supabase.auth.signInWithOAuth({
				provider: provider,
				options: {
					redirectTo: url.origin,
					scopes: "identify email guilds guilds.members.read"
				}
			})

			if (err) return fail(400, { message: "Something went wrong logging you in!" })

			throw redirect(303, data.url)
		}
	},

	logout: async ({ locals }) => {
		const { error } = await locals.supabase.auth.signOut()
		if (error) return fail(400, { message: "Something went wrong logging you out!" })
	}
}
