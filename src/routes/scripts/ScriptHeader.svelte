<script lang="ts">
	import StatsHeader from "./StatsHeader.svelte"

	export let id: string | undefined
	export let title: string | undefined
	export let username: string | undefined
	export let description: string | undefined
	export let hasLink: boolean = true
</script>

<header class="flex flex-col lg:flex-row my-4 justify-between w-full">
	<div class="my-auto lg:mx-4">
		<slot />
	</div>
	<div class="my-auto text-center lg:mx-4">
		<h1 class="font-bold my-4">
			{title ? title : "Loading..."} by

			{#if hasLink && username}
				<a href="/scripters/{username}"> {username} </a>
			{:else}
				<span> {username ?? "Loading..."} </span>
			{/if}
		</h1>
		<h2 class="my-4">
			{description ?? "Loading..."}
		</h2>
		<h3 class="my-4">
			{id ?? "Loading..."}
		</h3>
		<StatsHeader bind:id />
	</div>
</header>
