<script context="module">
	import { load } from "./_slug"
	export { load }
</script>

<script>
	import { supabase } from "$lib/supabase.js"
	import { user } from "$lib/stores/authStore"

	export let dev

	const handleSubmit = async () => {
		let id = dev.id
		const { error } = await supabase
			.from("devs")
			.update({
				real_name: dev.real_name,
				username: dev.username,
				github: dev.github,
				paypal_id: dev.paypal_id,
				description: dev.description
			})
			.match({ id })

		if (error) return console.error(error)
	}
</script>

<div class="container mx-auto my-6 max-w-2xl flex-grow">
	{#if $user.id === dev.id || $user.id === "4dbcf43d-cc8a-48e3-aead-2c55a3f302ee"}
		<form class="form my-6" on:submit|preventDefault={handleSubmit}>
			<div class="flex flex-col text-sm mb-2">
				<label for="real_name" class="font-bold mb-2"> Real name: </label>
				<input
					type="text"
					name="real_name"
					class="appearance-none shadow-sm border border-orange-200 p-2 focus:outline-none focus:border-orange-500 rounded-md text-black"
					bind:value={dev.real_name}
				/>
			</div>

			<div class="flex flex-col text-sm mb-2">
				<label for="username" class="font-bold mb-2"> Username: </label>
				<input
					type="text"
					name="username"
					class="appearance-none shadow-sm border border-orange-200 p-2 focus:outline-none focus:border-orange-500 rounded-md text-black"
					bind:value={dev.username}
				/>
			</div>

			<div class="flex flex-col text-sm mb-2">
				<label for="github" class="font-bold mb-2"> Github link: </label>
				<input
					type="text"
					name="github"
					class="appearance-none shadow-sm border border-orange-200 p-2 focus:outline-none focus:border-orange-500 rounded-md text-black"
					bind:value={dev.github}
				/>
			</div>

			<div class="flex flex-col text-sm mb-2">
				<label for="paypal_id" class="font-bold mb-2">
					Paypal button id (e.g: TK2J2HHC6YQ5C):
				</label>
				<input
					type="text"
					name="paypal_id"
					class="appearance-none shadow-sm border border-orange-200 p-2 focus:outline-none focus:border-orange-500 rounded-md text-black"
					bind:value={dev.paypal_id}
				/>
			</div>

			<div class="flex flex-col text-sm mb-2">
				<label for="description" class="font-bold mb-2"> Information: </label>
				<textarea
					type="text"
					name="description"
					class="appearance-none shadow-sm border border-orange-200 p-2 focus:outline-none focus:border-orange-500 rounded-md text-black"
					bind:value={dev.description}
				/>
			</div>

			<button
				type="submit"
				class="px-6 py-2.5 text-white text-xs font-semibold leading-tight uppercase rounded shadow-md hover:shadow-lg active:shadow-lg transition duration-150 ease-in-out flex items-center justify-between 
			bg-orange-500 hover:bg-orange-600 dark:bg-orange-400 dark:hover:bg-orange-500 my-2"
			>
				Update
			</button>
		</form>
	{:else}
		You don't have permission to edit this post.
	{/if}
</div>
