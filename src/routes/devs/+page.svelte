<script lang="ts">
	import { invalidate } from "$app/navigation"
	import { page } from "$app/stores"
	import { onMount } from "svelte"
	import type { PageData } from "./$types"
	import { browser } from "$app/environment"
	import MetaTags from "$lib/components/MetaTags.svelte"
	import DevCard from "./DevCard.svelte"
	export let data: PageData

	const pageStr = $page.url.searchParams.get("page") || "-1"
	let currentPage = Number(pageStr) < 0 || Number.isNaN(Number(pageStr)) ? 1 : Number(pageStr)

	let search: string

	function replaceQuery(values: Record<string, string>) {
		const currentURL = window.location.toString()

		const url = new URL(currentURL)
		for (let [k, v] of Object.entries(values)) {
			if (!!v && v !== "") url.searchParams.set(encodeURIComponent(k), encodeURIComponent(v))
			else url.searchParams.delete(k)
		}
		history.replaceState({}, "", url)
		invalidate("developers:devs")
	}

	const { range } = data
	const count = (data.count as number) || 0
	const totalPages = Math.ceil(count / range)

	onMount(() => replaceQuery({ search: search }))

	$: if (browser) replaceQuery({ page: currentPage.toString() })
	$: if (browser) replaceQuery({ search: search })
</script>

<svelte:head>
	<MetaTags
		title="Developers"
		description="List of developers that are behind the project directly and/or indirerectly."
	/>
</svelte:head>

<main>
	<header class="text-center py-8">
		<h3>Welcome to the DevBlog.</h3>
		<p>Here you can find guides, tutorials and feature annoucements.</p>
	</header>

	<div class="py-6">
		<div class="text-center form my-6">
			<header class="py-4"><h4>Search:</h4></header>
			<div class="max-w-2xl mx-auto justify-center md:flex md:space-x-5 mb-2">
				<div class="w-full flex flex-col text-sm mb-2">
					<input
						type="search"
						placeholder="Search username, name, info, ..."
						class="input"
						bind:value={search}
					/>
				</div>
			</div>
		</div>
	</div>

	<div class="mx-auto max-w-2xl flex-grow">
		{#if data.devs}
			{#each data.devs as developer}
				<DevCard bind:developer />
			{/each}
		{/if}
	</div>

	<nav class="flex justify-between items-center pt-4" aria-label="Table navigation">
		<span class="text-sm font-normal text-stone-500 dark:text-stone-400">
			Showing
			<span class="font-semibold text-stone-900 dark:text-white">
				{(currentPage - 1) * range + 1}-{(currentPage - 1) * range + range + 1}
			</span>
			of
			<span class="font-semibold text-stone-900 dark:text-white">{count}</span>
		</span>
		<ul class="inline-flex items-center -space-x-px">
			<li>
				<button
					class="block py-2 px-3 ml-0 leading-tight text-stone-500 bg-white rounded-l-lg border border-stone-300 hover:bg-stone-100 hover:text-stone-700 dark:bg-stone-800 dark:border-stone-700 dark:text-stone-400 dark:hover:bg-stone-700 dark:hover:text-white"
					on:click={() =>
						replaceQuery({ page: (currentPage - 1 > 0 ? currentPage - 1 : 1).toString() })}
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
						on:click={() => replaceQuery({ page: Number(idx + 1).toString() })}
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
						replaceQuery({
							page: (currentPage + 1 < totalPages ? currentPage + 1 : totalPages).toString()
						})}
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
