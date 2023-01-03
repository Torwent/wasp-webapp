<script lang="ts">
	import { createSearchStore, searchHandler } from "$lib/stores/search"
	import { onDestroy } from "svelte"

	import type { PageData } from "./$types"

	async function convertTime(t: number): Promise<string> {
		let days, hours, minutes, seconds, total_hours, total_minutes, total_seconds: number
		let result: string = ""

		total_seconds = Math.floor(t / 1000)
		total_minutes = Math.floor(total_seconds / 60)
		total_hours = Math.floor(total_minutes / 60)
		days = Math.floor(total_hours / 24)

		seconds = total_seconds % 60
		minutes = total_minutes % 60
		hours = total_hours % 24

		if (days > 0) result += days.toString() + "d "
		if (hours > 0) result += hours.toString() + "h "
		if (minutes > 0) result += minutes.toString() + "m "

		if ((days = 0 && seconds > 0)) result += seconds.toString() + "s"

		return result
	}

	async function formatRSNumber(n: number): Promise<string> {
		let i: number = 0
		let f: number = n
		let arr: string[] = ["", "K", "M", "B", "T"]

		while (Math.abs(f) >= 1000) {
			i++
			f = f / 1000
		}

		return parseFloat(f.toFixed(2)).toString() + " " + arr[i]
	}

	export let data: PageData

	type Stat = {
		biohash: string
		username: string
		experience: number
		gold: number
		levels: number
		runtime: number
		banned: boolean
	}

	const searchStats: Stat[] = data.stats.map((stat: Stat) => ({
		...stat,
		searchTerms: `${stat.biohash} ${stat.username}`
	}))

	const searchStore = createSearchStore(searchStats)
	const unsubscribe = searchStore.subscribe((model) => searchHandler(model))

	onDestroy(() => unsubscribe())
</script>

<p class="my-4">
	<span class="text-red-500">Disclaimer:</span>
	wasp-stats is a work in progress. Stats will be reset a couple of times during development! documentation
	can be found <a href="https://api.waspscripts.com/docs" class="text-amber-400">here</a>.
</p>
<div class="overflow-x-auto relative shadow-md sm:rounded-lg my-4">
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
				<th scope="col" class="py-3 px-6"> BioHash </th>
				<th scope="col" class="py-3 px-6"> Username </th>
				<th scope="col" class="py-3 px-6"> Experience </th>
				<th scope="col" class="py-3 px-6"> Gold </th>
				<th scope="col" class="py-3 px-6"> Levels </th>
				<th scope="col" class="py-3 px-6"> Runtime </th>
			</tr>
		</thead>
		<tbody>
			{#each $searchStore.filtered as entry}
				<tr
					class="bg-white border-b dark:bg-stone-800 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-600"
				>
					<th
						scope="row"
						class="py-4 px-6 font-medium text-stone-900 whitespace-nowrap dark:text-white"
					>
						{entry.biohash}
					</th>
					<th
						scope="row"
						class="py-4 px-6 font-medium text-stone-900 whitespace-nowrap dark:text-white"
					>
						{entry.username}
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