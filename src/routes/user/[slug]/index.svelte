<script context="module">
	import { load } from "./_slug"
	export { load }
</script>

<script lang="ts">
	import { fade } from "svelte/transition"
	import RoleBadges from "$lib/components/RoleBadges.svelte"
	import { supabase } from "$lib/supabase"

	let email: string = ""
	let password: string = ""

	let emailUpdated = false,
		passUpdated = false

	const supabaseUser = supabase.auth.user()

	if (supabaseUser != null && supabaseUser.email != null) {
		email = supabaseUser.email
	}

	export let user: {
		username: string
		id: string
		avatar: string
		dev: boolean
		premium: boolean
		vip: boolean
		tester: boolean
	}

	const validEmail = (input: string) => {
		let validRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/
		if (input.match(validRegex)) return true
		return false
	}

	const updateAccount = async () => {
		let obj: { email?: string; password?: string } = {}

		if (validEmail(email)) {
			emailUpdated =
				supabaseUser != null && supabaseUser.email != null && email !== supabaseUser.email
			obj.email = email
		}

		if (password != null && password.length > 6) {
			obj.password = password
			passUpdated = true
		}
		const { error } = await supabase.auth.update(obj)
		if (error) return console.error(error)
	}
</script>

{#if supabaseUser && user.id === supabaseUser.id}
	<div
		class="container mx-auto my-6 max-w-2xl flex-grow"
		in:fade={{ duration: 300, delay: 300 }}
		out:fade={{ duration: 300 }}
	>
		<h1 class="mb-4 font-bold text-3xl">Username: {user.username}</h1>
		<h2 class="font-semibold leading-normal mb-4">ID: {user.id}</h2>

		<RoleBadges profile={user} />

		<h3 class="py-8">
			<p class="text-orange-400">THIS IS NOT IN USE YET BUT WILL BE SOON!</p>

			If you want you can change your email/password already anyway. This will be used to login
			without discord in the future.
		</h3>

		<form class="form my-6" on:submit|preventDefault={updateAccount}>
			<div class="flex flex-col text-sm mb-2">
				<label for="email" class="font-bold mb-2"> Email: </label>
				<input
					type="text"
					name="email"
					class="p-2 rounded-lg appearance-none shadow-sm border-2 focus:outline-none
                border-orange-200 focus:border-orange-600 text-black"
					bind:value={email}
				/>
			</div>
			<div class="flex flex-col text-sm mb-2">
				<label for="password" class="font-bold mb-2"> Password: </label>

				<input
					autocomplete="false"
					type="password"
					name="password"
					class="p-2 rounded-lg appearance-none shadow-sm border-2 focus:outline-none
                border-orange-200 focus:border-orange-600 text-black"
					bind:value={password}
				/>
			</div>

			<button
				type="submit"
				class="px-6 py-2.5 text-white text-xs font-semibold leading-tight uppercase rounded shadow-md hover:shadow-lg active:shadow-lg transition duration-150 ease-in-out flex items-center
		justify-between bg-orange-500 hover:bg-orange-600 dark:bg-orange-400 dark:hover:bg-orange-500 my-2"
			>
				<span class="px-2">Update</span>
			</button>
		</form>

		{#if emailUpdated}
			Email was updated. You've received on both emails an email from noreply@mail.app.supabase.io
			to confirm the change.
		{/if}
		{#if passUpdated}
			Your password was updated.
		{/if}
	</div>
{/if}
