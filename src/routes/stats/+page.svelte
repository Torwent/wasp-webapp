<script lang="ts">
	import MetaTags from "$lib/components/MetaTags.svelte"
	import type { Stat } from "$lib/database/types"
	import { createSearchStore, searchHandler } from "$lib/stores/search"
	import { convertTime, formatRSNumber } from "$lib/utils"
	import { onDestroy } from "svelte"

	import type { PageData } from "./$types"

	export let data: PageData

	const searchStats: Stat[] = data.stats.map((stat: Stat) => ({
		...stat,
		searchTerms: `${stat.username}`,
		filters: ""
	}))

	const searchStore = createSearchStore(searchStats)
	const unsubscribe = searchStore.subscribe((model) => searchHandler(model))

	onDestroy(() => unsubscribe())

	let ascending = false
	let headers: (keyof Stat)[] = ["username", "experience", "gold", "levels", "runtime"]
	let selectedHeader: keyof Stat = "experience"
	let sortedStore = $searchStore.filtered

	function sortByNumber(header: keyof Stat) {
		selectedHeader = header
		ascending = !ascending
		sortedStore = $searchStore.filtered
		sortedStore = sortedStore.sort((obj1, obj2) => {
			if (header != "username") {
				return ascending ? obj2[header] - obj1[header] : obj1[header] - obj2[header]
			}

			if (obj1[header].toLocaleLowerCase() < obj2[header].toLocaleLowerCase())
				return ascending ? -1 : 1
			if (obj1[header].toLocaleLowerCase() > obj2[header].toLocaleLowerCase())
				return ascending ? 1 : -1
			return 0
		})
	}

	$: sortedStore = $searchStore.filtered
</script>

<svelte:head>
	<meta name="description" content="Wasp Scripts usage stats!" />
	<MetaTags title="Stats" description="Wasp Scripts usage stats!" url="/stats" />
</svelte:head>

<div class="overflow-x-auto relative shadow-md sm:rounded-lg my-4">
	<header class="">
		<h3 class="py-4 px-6 font-bold whitespace-nowrap text-center">
			Total experience:
			{#await formatRSNumber(data.total.experience)}
				<span class="py-4 pr-6"> ... </span>
			{:then value}
				<span class="py-4 pr-6"> {value} </span>
			{/await}
			Total gold:
			{#await formatRSNumber(data.total.gold)}
				<span class="py-4 pr-6"> ... </span>
			{:then value}
				<span class="py-4 pr-6"> {value} </span>
			{/await}
			Total levels:
			<span class="py-4 pr-6"> {data.total.levels} </span>
			Total runtime:
			{#await convertTime(data.total.runtime)}
				<span class="py-4 pr-6"> ... </span>
			{:then value}
				<span class="py-4 pr-6"> {value} </span>
			{/await}
		</h3>
	</header>

	<div class="flex flex-col text-sm mb-2">
		<input
			type="search"
			placeholder="Search biohash or username..."
			class="appearance-none shadow-sm border border-gray-200 p-2 focus:outline-none focus:border-gray-500 rounded-lg"
			bind:value={$searchStore.search}
		/>
	</div>

	<table class="w-full text-sm text-left text-stone-500 dark:text-stone-400">
		<thead
			class="text-xs text-stone-700 uppercase bg-stone-50 dark:bg-stone-700 dark:text-stone-400"
		>
			<tr>
				{#each headers as header}
					<th scope="col" class="py-3 px-6" on:click={() => sortByNumber(header)}>
						<div class="flex justify-between text-sm">
							<span>
								{header}
								{#if header === "levels"}
									<a href="/blog/WaspStats%20virtual%20levels" class="hover:text-amber-400"> * </a>
								{/if}
							</span>
							{#if selectedHeader === header}
								<span class="text-amber-400">
									{@html ascending ? "&#8638;" : "&#8643;"}
								</span>
							{/if}
						</div>
					</th>
				{/each}
			</tr>
		</thead>
		<tbody>
			{#each sortedStore as entry}
				<tr
					class="bg-white border-b dark:bg-stone-800 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-600"
				>
					<th
						scope="row"
						class="py-4 px-6 font-medium text-stone-900 whitespace-nowrap dark:text-white"
					>
						{#if entry.username}
							{entry.username}
						{:else}
							Anonymous
						{/if}
					</th>
					{#await formatRSNumber(entry.experience)}
						<td class="py-4 px-6"> ... </td>
					{:then value}
						<td class="py-4 px-6"> {value} </td>
					{/await}
					{#await formatRSNumber(entry.gold)}
						<td class="py-4 px-6"> ... </td>
					{:then value}
						<td class="py-4 px-6"> {value} </td>
					{/await}
					<td class="py-4 px-6"> {entry.levels} </td>
					{#await convertTime(entry.runtime)}
						<td class="py-4 px-6"> ... </td>
					{:then value}
						<td class="py-4 px-6"> {value} </td>
					{/await}
				</tr>
			{/each}
		</tbody>
	</table>
	<!-- <nav class="flex justify-between items-center pt-4" aria-label="Table navigation">
		<span class="text-sm font-normal text-stone-500 dark:text-stone-400"
			>Showing <span class="font-semibold text-stone-900 dark:text-white">1-10</span> of
			<span class="font-semibold text-stone-900 dark:text-white">1000</span></span
		>
		<ul class="inline-flex items-center -space-x-px">
			<li>
				<a
					href="#"
					class="block py-2 px-3 ml-0 leading-tight text-stone-500 bg-white rounded-l-lg border border-stone-300 hover:bg-stone-100 hover:text-stone-700 dark:bg-stone-800 dark:border-stone-700 dark:text-stone-400 dark:hover:bg-stone-700 dark:hover:text-white"
				>
					<span class="sr-only">Previous</span>
					<svg
						class="w-5 h-5"
						aria-hidden="true"
						fill="currentColor"
						viewBox="0 0 20 20"
						xmlns="http://www.w3.org/2000/svg"
						><path
							fill-rule="evenodd"
							d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
							clip-rule="evenodd"
						/></svg
					>
				</a>
			</li>
			<li>
				<a
					href="#"
					class="py-2 px-3 leading-tight text-stone-500 bg-white border border-stone-300 hover:bg-stone-100 hover:text-stone-700 dark:bg-stone-800 dark:border-stone-700 dark:text-stone-400 dark:hover:bg-stone-700 dark:hover:text-white"
					>1</a
				>
			</li>
			<li>
				<a
					href="#"
					class="py-2 px-3 leading-tight text-stone-500 bg-white border border-stone-300 hover:bg-stone-100 hover:text-stone-700 dark:bg-stone-800 dark:border-stone-700 dark:text-stone-400 dark:hover:bg-stone-700 dark:hover:text-white"
					>2</a
				>
			</li>
			<li>
				<a
					href="#"
					aria-current="page"
					class="z-10 py-2 px-3 leading-tight text-blue-600 bg-blue-50 border border-blue-300 hover:bg-blue-100 hover:text-blue-700 dark:border-stone-700 dark:bg-stone-700 dark:text-white"
					>3</a
				>
			</li>
			<li>
				<a
					href="#"
					class="py-2 px-3 leading-tight text-stone-500 bg-white border border-stone-300 hover:bg-stone-100 hover:text-stone-700 dark:bg-stone-800 dark:border-stone-700 dark:text-stone-400 dark:hover:bg-stone-700 dark:hover:text-white"
					>...</a
				>
			</li>
			<li>
				<a
					href="#"
					class="py-2 px-3 leading-tight text-stone-500 bg-white border border-stone-300 hover:bg-stone-100 hover:text-stone-700 dark:bg-stone-800 dark:border-stone-700 dark:text-stone-400 dark:hover:bg-stone-700 dark:hover:text-white"
					>100</a
				>
			</li>
			<li>
				<a
					href="#"
					class="block py-2 px-3 leading-tight text-stone-500 bg-white rounded-r-lg border border-stone-300 hover:bg-stone-100 hover:text-stone-700 dark:bg-stone-800 dark:border-stone-700 dark:text-stone-400 dark:hover:bg-stone-700 dark:hover:text-white"
				>
					<span class="sr-only">Next</span>
					<svg
						class="w-5 h-5"
						aria-hidden="true"
						fill="currentColor"
						viewBox="0 0 20 20"
						xmlns="http://www.w3.org/2000/svg"
						><path
							fill-rule="evenodd"
							d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
							clip-rule="evenodd"
						/></svg
					>
				</a>
			</li>
		</ul>
	</nav> -->
</div>
