<script lang="ts">
	import { invalidate } from "$app/navigation"
	import { page } from "$app/stores"
	import { onMount } from "svelte"
	import { formatTime, formatNumber } from "$lib/utils"
	import StatsTable from "./StatsTable.svelte"
	import { replaceQuery } from "$lib/client/utils"

	export let data

	let { supabaseClient, totals, stats, amount } = data
	$: ({ supabaseClient, totals, stats, amount } = data)

	let { searchParams } = $page.url
	$: ({ searchParams } = $page.url)

	let search = decodeURIComponent(searchParams.get("search") || "").trim()

	let count: number = stats.count
	$: count = stats.count

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

<main class="overflow-x-auto relative mx-4 md:mx-16 lg:mx-24">
	<header class="text-sm lg:text-lg flex-col text-center my-4">
		<h5 class="md:whitespace-nowrap">
			Total experience: <wbr />
			{formatNumber(totals.experience)}
		</h5>
		<h5 class="md:whitespace-nowrap">Total gold: <wbr /> {formatNumber(totals.gold)}</h5>
		<h5 class="md:whitespace-nowrap">Total levels: <wbr /> {formatNumber(totals.levels)}</h5>
		<h5 class="md:whitespace-nowrap">Total runtime: <wbr /> {formatTime(totals.runtime)}</h5>
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

	<StatsTable bind:search bind:amount bind:count>
		{#each stats.stats as entry}
			<tr>
				<th scope="row" class="px-4 font-medium text-surface-900-50-token md:whitespace-nowrap">
					{entry.username !== "" ? entry.username : "Anonymous"}
				</th>
				<td class="px-4 w-64">{formatNumber(entry.experience)}</td>
				<td class="px-4 w-64">{formatNumber(entry.gold)}</td>
				<td class="px-4 w-64">{formatNumber(entry.levels)}</td>
				<td class="px-4 w-64">{formatTime(entry.runtime)}</td>
			</tr>
		{/each}
	</StatsTable>
</main>
