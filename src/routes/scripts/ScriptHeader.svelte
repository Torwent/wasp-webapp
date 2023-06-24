<script lang="ts">
	import { page } from "$app/stores"

	export let title: string = ""
	export let username: string = $page.data.profile?.username || ""
	export let hasLink: boolean = true
</script>

<div class="absolute inset-0 container min-w-full h-96 mx-0 flex flex-col">
	<slot />
	<!-- Title and author -->
	<header class="mt-auto z-[1] text-center h-32 text-primary-500">
		<h1 class="font-bold text-sm text-shadow drop-shadow-2xl">{title}</h1>

		<h2 class="text-xl">
			{#if hasLink}
				<a href="/developers/{username}" class="font-semibold text-xl text-shadow drop-shadow-2xl">
					by {username}
				</a>
			{:else}
				<span class="font-semibold text-xl text-shadow drop-shadow-2xl">
					by {username}
				</span>
			{/if}
		</h2>
	</header>
	<div
		class="z-[0] bottom-0 absolute h-44 w-full opacity-100 bg-gradient-to-t from-white/60 via-white-800/40
				 dark:from-black/60 dark:via-gray-800/40 to-transparent"
	/>
</div>
