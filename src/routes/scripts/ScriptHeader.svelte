<script lang="ts">
	export let title: string | null | undefined = null
	export let username: string | null | undefined = null
	export let hasLink: boolean = true
</script>

<div class="absolute inset-0 container min-w-full h-96 mx-0 flex flex-col">
	<slot />
	<header class="mt-auto z-[1] text-center h-32 text-primary-500">
		<h1 class="text-3xl font-bold text-shadow drop-shadow-2xl">
			{title ? title : "Loading..."}
		</h1>

		<h2 class="text-xl">
			{#if hasLink && username}
				<a href="/scripters/{username}" class="font-semibold text-xl text-shadow drop-shadow-2xl">
					by {username}
				</a>
			{:else}
				<span class="font-semibold text-xl text-shadow drop-shadow-2xl">
					by {username ? username : "Loading..."}
				</span>
			{/if}
		</h2>
	</header>
	<div
		class="z-[0] bottom-0 absolute h-44 w-full opacity-100 bg-gradient-to-t from-white/60 via-white-800/40
				 dark:from-black/60 dark:via-gray-800/40 to-transparent"
	/>
</div>
