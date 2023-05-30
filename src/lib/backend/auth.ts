import type { SupabaseClient, User } from "@supabase/supabase-js"

import { get, writable } from "svelte/store"

export const supabaseStore: any = writable(false)
export const userFast: any = writable(false)
export const userSlow: any = writable(false)

/* 
Functions named with "Fast":
- Gets the user from the current local session. Good for quick operations that don't require unauthorized access.
Functions named with "Slow":
- Gets the user id from the database. Must be used in things that the user might not be authorized to do.
 */

async function getUserFast() {
	const tmp = get(userFast)
	if (tmp) return tmp as User
	const supabase = get(supabaseStore) as SupabaseClient
	const {
		data: { session }
	} = await supabase.auth.getSession()

	const user = session?.user
	const result = user != null ? user : false
	userFast.set(result)
	return result
}

async function getUserSlow() {
	const supabase = get(supabaseStore) as SupabaseClient
	const {
		data: { user }
	} = await supabase.auth.getUser()

	const result = user != null ? user : false
	userFast.set(result)
	userSlow.set(result)
	return result
}

export async function getUserID(fast: boolean = true) {
	const user = fast ? await getUserFast() : await getUserSlow()

	return user ? user.id : false
}

export async function login(redirect: string) {
	const supabase = get(supabaseStore) as SupabaseClient
	const { error } = await supabase.auth.signInWithOAuth({
		provider: "discord",
		options: {
			redirectTo: redirect,
			scopes: "identify email guilds guilds.members.read"
		}
	})

	if (error) console.error(error)
}

export async function logout() {
	const supabase = get(supabaseStore) as SupabaseClient
	const { error } = await supabase.auth.signOut()
	if (error) console.error(error)
}

export async function getSession() {
	const supabase = get(supabaseStore) as SupabaseClient
	const {
		data: { session }
	} = await supabase.auth.getSession()

	return session
}
