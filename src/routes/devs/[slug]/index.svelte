<script context="module">
	import { load } from "./_slug"
	export { load }
</script>

<script>
	import Markdown from "$lib/Markdown.svelte"
	import { fade } from "svelte/transition"
	import { user } from "$lib/stores/authStore"
	export let dev
</script>

<svelte:head>
	<title>{dev.username} - Waspscripts</title>
	<meta name="description" content={dev.description} />
</svelte:head>

<div
	class="container mx-auto my-6 max-w-2xl flex-grow"
	in:fade={{ duration: 300, delay: 300 }}
	out:fade={{ duration: 300 }}
>
	<div class="flex justify-between">
		<header>
			<h1 class="mb-4 font-bold text-3xl">
				{#if dev.real_name}
					{dev.real_name} /
				{/if}
				{#if dev.username}
					{dev.username}
				{/if}
			</h1>
		</header>

		<div class="flex justify-evenly w-64">
			<a href="https://github.com/slackydev" class="hover:text-amber-500 dark:hover:text-amber-400">
				<svg class="w-10 h-10" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
					<path
						fill-rule="evenodd"
						d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
						clip-rule="evenodd"
					/>
				</svg>
			</a>
			{#if dev.paypal_id !== "" && dev.paypal_id !== null}
				<form
					action="https://www.paypal.com/donate"
					method="post"
					target="_top"
					class="flex justify-center align-middle"
				>
					<input type="hidden" name="hosted_button_id" value={dev.paypal_id} />
					<button
						type="submit"
						class="w-44 h-10 text-gray-900 bg-[#F7BE38] hover:bg-[#F7BE38]/90 focus:ring-4 focus:ring-[#F7BE38]/50 font-medium rounded-lg text-sm px-5 py-2.5 text-center items-center dark:focus:ring-[#F7BE38]/50 mr-2 mb-2
					flex justify-center"
					>
						<svg
							class="mr-2 -ml-1 w-4 h-4"
							aria-hidden="true"
							focusable="false"
							data-prefix="fab"
							data-icon="paypal"
							role="img"
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 384 512"
							><path
								fill="currentColor"
								d="M111.4 295.9c-3.5 19.2-17.4 108.7-21.5 134-.3 1.8-1 2.5-3 2.5H12.3c-7.6 0-13.1-6.6-12.1-13.9L58.8 46.6c1.5-9.6 10.1-16.9 20-16.9 152.3 0 165.1-3.7 204 11.4 60.1 23.3 65.6 79.5 44 140.3-21.5 62.6-72.5 89.5-140.1 90.3-43.4 .7-69.5-7-75.3 24.2zM357.1 152c-1.8-1.3-2.5-1.8-3 1.3-2 11.4-5.1 22.5-8.8 33.6-39.9 113.8-150.5 103.9-204.5 103.9-6.1 0-10.1 3.3-10.9 9.4-22.6 140.4-27.1 169.7-27.1 169.7-1 7.1 3.5 12.9 10.6 12.9h63.5c8.6 0 15.7-6.3 17.4-14.9 .7-5.4-1.1 6.1 14.4-91.3 4.6-22 14.3-19.7 29.3-19.7 71 0 126.4-28.8 142.9-112.3 6.5-34.8 4.6-71.4-23.8-92.6z"
							/></svg
						>
						Donate to {dev.username}
					</button>
				</form>
			{/if}
		</div>
	</div>
	<article class="prose dark:prose-invert py-6 border-t-2 border-stone-300 dark:border-stone-800">
		<h3>Worked on:</h3>
		<Markdown src={dev.description} />
	</article>

	{#if $user.id === dev.id || $user.id === "4dbcf43d-cc8a-48e3-aead-2c55a3f302ee"}
		<a href="/devs/{dev.username}/edit">
			<button
				data-mdb-ripple="true"
				data-mdb-ripple-color="light"
				class="px-6 py-2.5 text-white text-xs font-semibold leading-tight uppercase rounded shadow-md hover:shadow-lg active:shadow-lg transition duration-150 ease-in-out flex items-center justify-between 
			bg-orange-500 hover:bg-orange-600 dark:bg-orange-400 dark:hover:bg-orange-500 my-2"
			>
				Edit
			</button>
		</a>
	{/if}
</div>
