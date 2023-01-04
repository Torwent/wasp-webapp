<script lang="ts">
	import { fade } from "svelte/transition"
	import MetaTags from "$lib/components/MetaTags.svelte"
	import type { PageData } from "./$types"
	import type { Developer } from "$lib/database/types"
	import { createSearchStore, searchHandler } from "$lib/stores/search"
	import { onDestroy } from "svelte"
	import DevCard from "./DevCard.svelte"

	export let data: PageData

	const searchStats: Developer[] = data.devs.map((stat: Developer) => ({
		...stat,
		searchTerms: `${stat.real_name} ${stat.username} ${stat.description} ${stat.content}`,
		filters: ""
	}))

	const searchStore = createSearchStore(searchStats)
	const unsubscribe = searchStore.subscribe((model) => searchHandler(model))

	onDestroy(() => unsubscribe())
</script>

<svelte:head>
	<MetaTags
		title="Developers"
		description="List of developers that are behind the project directly and/or indirerectly."
		url="/devs"
	/>
</svelte:head>

<div
	class="container mx-auto my-6 max-w-2xl flex-grow"
	in:fade={{ duration: 300, delay: 300 }}
	out:fade={{ duration: 300 }}
>
	<header class="text-center py-8">
		<h3>Welcome to the Devs setion.</h3>
		<p>
			Here you can find information about the developers that make <b>WaspScripts</b> possible.
		</p>
	</header>
	<div class="py-6">
		<div class="flex flex-col text-sm mb-2">
			<input
				type="search"
				placeholder="Search.."
				class="appearance-none shadow-sm border border-gray-200 p-2 focus:outline-none focus:border-gray-500 rounded-lg"
				bind:value={$searchStore.search}
			/>
		</div>
	</div>

	<div class="overflow-hidden">
		{#each $searchStore.filtered as dev}
			<DevCard {dev} />
		{/each}
	</div>
</div>
