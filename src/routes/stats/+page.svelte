<script lang="ts">
	import { invalidate } from "$app/navigation"
	import { page } from "$app/stores"
	import { browser } from "$app/environment"
	import { onMount } from "svelte"

	import { fade } from "svelte/transition"
	import type { Stat } from "$lib/backend/types"
	import { convertTime, formatRSNumber } from "$lib/utils"
	import MetaTags from "$lib/components/MetaTags.svelte"
	import Paginator from "$lib/components/Paginator.svelte"

	export let data

	const pageStr = $page.url.searchParams.get("page") || "-1"
	let currentPage = Number(pageStr) < 0 || Number.isNaN(Number(pageStr)) ? 1 : Number(pageStr)

	let search = decodeURI($page.url.searchParams.get("search") || "")
	let ascending = $page.url.searchParams.get("ascending")?.toLowerCase() === "true"
	let headers: (keyof Stat)[] = ["username", "experience", "gold", "levels", "runtime"]
	let selectedHeader: keyof Stat =
		($page.url.searchParams.get("order") as keyof Stat) || "experience"
	let loading = true

	function replaceQuery(values: Record<string, string>) {
		if (!browser) return
		for (let [k, v] of Object.entries(values)) {
			if (!!v && v !== "") $page.url.searchParams.set(encodeURIComponent(k), encodeURIComponent(v))
			else $page.url.searchParams.delete(k)
		}

		if (loading) return

		history.replaceState({}, "", $page.url)
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

	const { range } = data

	let count = 0
	$: count = (data.count as number) || 0

	onMount(() => {
		loading = false
		rerunLoad()
	})

	$: if (browser) replaceQuery({ search: search })

	$: replaceQuery({ page: currentPage.toString() })
	$: replaceQuery({ page: "1", search: search })
	$: replaceQuery({ ascending: ascending.toString() })
</script>

<svelte:head>
	<MetaTags title="Stats" description="Wasp Scripts usage stats!" />
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
										href="/tutorials/waspstats-virtual-levels-by-torwent"
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

	<Paginator srcData={"tutorials:posts"} bind:currentPage {range} bind:count />
</main>
