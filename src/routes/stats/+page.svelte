<script lang="ts">
	import { invalidate } from "$app/navigation"
	import { page } from "$app/stores"
	import { onMount } from "svelte"
	import { formatTime, formatNumber } from "$lib/utils"
	import StatsTable from "./StatsTable.svelte"
	import { replaceQuery } from "$lib/client/utils"
	import type { Stats } from "$lib/types/collection"

	export let data

	let { supabaseClient, totalPromise, statsPromise, range } = data
	$: ({ supabaseClient, totalPromise, statsPromise, range } = data)

	let { searchParams } = $page.url
	$: ({ searchParams } = $page.url)

	let search = decodeURIComponent(searchParams.get("search") || "").trim()

	let stats: Stats[] | null = null
	let count: number = 0

	$: statsPromise.then((awaited) => {
		stats = awaited.stats
		count = awaited.count
	})

	onMount(() => {
		const subscription = supabaseClient
			.channel("stats-changed")
			.on(
				"postgres_changes",
				{
					event: "UPDATE",
					schema: "public",
					table: "stats_simba"
				},
				() => invalidate("supabase:stats")
			)
			.subscribe()

		return () => subscription.unsubscribe()
	})

	const headTitle = "Stats - WaspScripts"
	const headDescription = "WaspScripts usage stats."
	const headKeywords =
		"OldSchool, RuneScape, OSRS, 2007, Color, Colour,  Bot, Wasp, Scripts, Simba, Stats"
	const headAuthor = "Torwent"
	const headImage = "/multi-color-logo.png"
</script>

<svelte:head>
	<title>{headTitle}</title>
	<meta name="description" content={headDescription} />
	<meta name="keywords" content={headKeywords} />
	<meta name="author" content={headAuthor} />
	<meta name="robots" content="all" />

	<!-- OpenGraph tags -->
	<meta property="og:type" content="website" />
	<meta property="og:title" content={headTitle} />
	<meta property="og:url" content={$page.url.href} />
	<meta property="og:image" content={headImage} />
	<meta property="og:image:type" content="image/png" />
	<meta property="og:image:alt" content="WaspScripts Logo" />
	<meta property="og:description" content={headDescription} />

	<!-- Twitter tags -->
	<meta name="twitter:card" content="summary" />
	<meta name="twitter:title" content={headTitle} />
	<meta name="twitter:description" content={headDescription} />
	<meta name="twitter:image" content={headImage} />
</svelte:head>

<main class="overflow-x-auto relative sm:rounded-lg my-4 mx-12 md:mx-16 lg:mx-24">
	<header>
		<h5 class="py-4 px-6 font-bold text-center whitespace-nowrap">
			{#await totalPromise}
				Total experience: <span class="py-4 pr-6"> ... </span>
				<wbr />
				Total gold: <span class="py-4 pr-6"> ... </span>
				<wbr />
				Total levels: <span class="py-4 pr-6">...</span>
				<wbr />
				Total runtime: <span class="py-4 pr-6"> ... </span>
			{:then total}
				Total experience: <span class="py-4 pr-6"> {formatNumber(total.experience)} </span>
				<wbr />
				Total gold:
				<span class="py-4 pr-6"> {formatNumber(total.gold)} </span>
				<wbr />
				Total levels: <span class="py-4 pr-6">{formatNumber(total.levels)}</span>
				<wbr />
				Total runtime: <span class="py-4 pr-6"> {formatTime(total.runtime)} </span>
			{/await}
		</h5>
	</header>

	<div class="mx-auto lg:w-[80%] flex flex-col mb-2">
		<input
			type="text"
			placeholder="Search UUID or username..."
			class="input"
			bind:value={search}
			on:input={async () =>
				await replaceQuery($page.url, {
					page: "1",
					search: search
				})}
		/>
	</div>

	{#await statsPromise}
		<StatsTable bind:search bind:range>
			{#each Array(search === "" ? 20 : 1) as _}
				<tr class="animate-pulse">
					<th
						scope="row"
						class="py-4 px-6 font-medium text-stone-900 whitespace-nowrap dark:text-white w-96"
					>
						Loading...
					</th>
					{#each Array(4) as _}
						<td class="py-4 px-6 w-64">Loading...</td>
					{/each}
				</tr>
			{/each}
		</StatsTable>
	{:then stats}
		<StatsTable bind:search bind:range bind:count>
			{#each stats.stats as entry}
				<tr>
					<th
						scope="row"
						class="py-4 px-6 font-medium text-stone-900 whitespace-nowrap dark:text-white w-96"
					>
						{entry.username !== "" ? entry.username : "Anonymous"}
					</th>
					<td class="py-4 px-6 w-64">{formatNumber(entry.experience)}</td>
					<td class="py-4 px-6 w-64">{formatNumber(entry.gold)}</td>
					<td class="py-4 px-6 w-64">{formatNumber(entry.levels)}</td>
					<td class="py-4 px-6 w-64">{formatTime(entry.runtime)}</td>
				</tr>
			{/each}
		</StatsTable>
	{/await}
</main>
