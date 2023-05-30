<script lang="ts">
	import { goto, invalidate } from "$app/navigation"
	import { page } from "$app/stores"
	import { browser } from "$app/environment"
	import { onMount } from "svelte"

	import { fade } from "svelte/transition"
	import type { Stat } from "$lib/backend/types"
	import { convertTime, formatRSNumber } from "$lib/utils"
	import MetaTags from "$lib/components/MetaTags.svelte"

	export let data

	let search: string
	let ascending = $page.url.searchParams.get("ascending")?.toLowerCase() === "true"
	let headers: (keyof Stat)[] = ["username", "experience", "gold", "levels", "runtime"]
	let selectedHeader: keyof Stat =
		($page.url.searchParams.get("order") as keyof Stat) || "experience"

	function preserveScroll(url: string) {
		search = ""
		const currentURL = new URL(window.location.toString())
		const searchParams = currentURL.searchParams.toString()
		goto(url + "?" + searchParams, { noScroll: true })
	}

	function replaceQuery(values: Record<string, string>) {
		const currentURL = window.location
			.toString()
			.replace(/\/stats\/([0-9][0-9][0-9][0-9]|[0-9][0-9][0-9]|[0-9][0-9]|[0-9])/, "/stats/1")
		const url = new URL(currentURL)
		for (let [k, v] of Object.entries(values)) {
			if (!!v && v !== "") url.searchParams.set(encodeURIComponent(k), encodeURIComponent(v))
			else url.searchParams.delete(k)
		}
		history.replaceState({}, "", url)
		invalidate("stats:total")
	}

	function rerunLoad() {
		invalidate("stats:total")
		setTimeout(rerunLoad, 5000)
	}

	function sortBy(header: keyof Stat) {
		search = ""
		ascending = selectedHeader === header ? !ascending : false
		selectedHeader = header
		replaceQuery({
			ascending: ascending ? "true" : "false",
			order: header
		})
	}

	const range = data.range
	const totalEntries = data.totalEntries || 0 //this shouldn't be needed but vscode complains...
	const totalPages = Math.ceil(totalEntries / range)

	onMount(() => {
		replaceQuery({ search: search })
		rerunLoad()
	})

	$: currentPage = Number($page.params.page) || 1
	$: $page.url.searchParams.set("search", search)
	$: if (browser) replaceQuery({ search: search })
</script>

<svelte:head>
	<MetaTags title="Stats" description="Wasp Scripts usage stats!" robots={"noindex"} />
</svelte:head>

<main
	class="overflow-x-auto relative shadow-md sm:rounded-lg my-4 mx-12 md:mx-16 lg:mx-24"
	in:fade={{ duration: 300, delay: 300 }}
	out:fade={{ duration: 300 }}
>
	<header class="">
		<h5 class="py-4 px-6 font-bold text-center whitespace-nowrap">
			Total experience:
			<span class="py-4 pr-6">
				{#await formatRSNumber(data.total.experience)}...{:then value}{value}{/await}
			</span>
			<wbr />
			Total gold:
			<span class="py-4 pr-6">
				{#await formatRSNumber(data.total.gold)}... {:then value}{value} {/await}
			</span>
			<wbr />
			Total levels:
			<span class="py-4 pr-6">{data.total.levels}</span>
			<wbr />
			Total runtime:
			<span class="py-4 pr-6">
				{#await convertTime(data.total.runtime)}...{:then value} {value} {/await}
			</span>
		</h5>
	</header>

	<div class="flex flex-col text-sm mb-2">
		<input
			type="search"
			placeholder="Search UUID or username..."
			class="appearance-none shadow-sm border border-gray-200 p-2 focus:outline-none focus:border-gray-500 rounded-lg text-black"
			bind:value={search}
		/>
	</div>

	<table class="w-full text-sm text-left text-stone-500 dark:text-stone-400">
		<thead
			class="text-xs text-stone-700 uppercase bg-stone-50 dark:bg-stone-700 dark:text-stone-400"
		>
			<tr>
				{#each headers as header}
					<th scope="col" class="py-3 px-6" on:click={() => sortBy(header)}>
						<div class="flex justify-between text-sm">
							<span>
								{header}
								{#if header === "levels"}
									<a
										href="/blog/WaspStats%20virtual%20levels"
										class="text-stone-700 dark:text-stone-400 hover:text-primary-400"
									>
										*
									</a>
								{/if}
							</span>
							{#if selectedHeader === header}
								<span class="text-primary-400">
									{@html ascending ? "&#8638;" : "&#8643;"}
								</span>
							{/if}
						</div>
					</th>
				{/each}
			</tr>
		</thead>
		<tbody>
			{#each data.stats as entry}
				<tr
					class="bg-white border-b dark:bg-stone-800 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-600"
				>
					<th
						scope="row"
						class="py-4 px-6 font-medium text-stone-900 whitespace-nowrap dark:text-white w-96"
					>
						{#if entry.username}
							{entry.username}
						{:else}
							Anonymous
						{/if}
					</th>
					<td class="py-4 px-6 w-64">
						{#await formatRSNumber(entry.experience)}
							...
						{:then value}
							{value}
						{/await}
					</td>
					<td class="py-4 px-6 w-64">
						{#await formatRSNumber(entry.gold)}
							...
						{:then value}
							{value}
						{/await}
					</td>
					<td class="py-4 px-6 w-64">{entry.levels}</td>
					<td class="py-4 px-6 w-64">
						{#await convertTime(entry.runtime)}
							...
						{:then value}
							{value}
						{/await}
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
	<nav class="flex justify-between items-center pt-4" aria-label="Table navigation">
		<span class="text-sm font-normal text-stone-500 dark:text-stone-400">
			Showing <span class="font-semibold text-stone-900 dark:text-white">
				{(currentPage - 1) * range + 1}-{(currentPage - 1) * range + range + 1}
			</span>
			of
			<span class="font-semibold text-stone-900 dark:text-white">{totalEntries}</span>
		</span>
		<ul class="inline-flex items-center -space-x-px">
			<li>
				<button
					class="block py-2 px-3 ml-0 leading-tight text-stone-500 bg-white rounded-l-lg border border-stone-300 hover:bg-stone-100 hover:text-stone-700 dark:bg-stone-800 dark:border-stone-700 dark:text-stone-400 dark:hover:bg-stone-700 dark:hover:text-white"
					on:click={() => preserveScroll("/stats/" + (currentPage - 1 > 0 ? currentPage - 1 : 1))}
				>
					<span class="sr-only">Previous</span>
					<svg
						class="w-5 h-5"
						aria-hidden="true"
						fill="currentColor"
						viewBox="0 0 20 20"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							fill-rule="evenodd"
							d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
							clip-rule="evenodd"
						/>
					</svg>
				</button>
			</li>

			{#each Array(totalPages) as _, idx}
				<li>
					<button
						class="py-2 px-3 leading-tight text-stone-500 bg-white border border-stone-300 hover:bg-stone-100 hover:text-stone-700 dark:bg-stone-800 dark:border-stone-700 dark:text-stone-400 dark:hover:bg-stone-700 dark:hover:text-white"
						on:click={() => preserveScroll("/stats/" + (idx + 1))}
						class:text-primary-500={currentPage === idx + 1}
						class:dark:text-primary-400={currentPage === idx + 1}
					>
						{idx + 1}
					</button>
				</li>
			{/each}

			<li>
				<button
					class="block py-2 px-3 leading-tight text-stone-500 bg-white rounded-r-lg border border-stone-300 hover:bg-stone-100 hover:text-stone-700 dark:bg-stone-800 dark:border-stone-700 dark:text-stone-400 dark:hover:bg-stone-700 dark:hover:text-white"
					on:click={() =>
						preserveScroll(
							"/stats/" + (currentPage + 1 < totalPages ? currentPage + 1 : totalPages)
						)}
				>
					<span class="sr-only">Next</span>
					<svg
						class="w-5 h-5"
						aria-hidden="true"
						fill="currentColor"
						viewBox="0 0 20 20"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							fill-rule="evenodd"
							d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
							clip-rule="evenodd"
						/>
					</svg>
				</button>
			</li>
		</ul>
	</nav>
</main>
