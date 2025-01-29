<script lang="ts">
	import { invalidate } from "$app/navigation"
	import { page } from "$app/state"
	import { onMount } from "svelte"
	import { formatTime, formatNumber } from "$lib/utils"
	import StatsTable from "./StatsTable.svelte"
	import { replaceQuery } from "$lib/client/utils"

	const { data } = $props()

	let {
		supabaseClient,
		totals,
		stats: { stats, count }
	} = $derived(data)
	let { amount } = $state(data)

	let search = $state(decodeURIComponent(page.url.searchParams.get("search") || "").trim())

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
	<meta property="og:url" content={page.url.href} />
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

<main class="mx-4 my-8 h-fit flex-grow md:mx-16 lg:mx-24">
	<header class="my-4 flex-col text-center text-sm lg:text-lg">
		<h5 class="md:whitespace-nowrap">
			Total experience: <wbr />
			{formatNumber(totals.experience)}
		</h5>
		<h5 class="md:whitespace-nowrap">Total gold: <wbr /> {formatNumber(totals.gold)}</h5>
		<h5 class="md:whitespace-nowrap">Total levels: <wbr /> {formatNumber(totals.levels)}</h5>
		<h5 class="md:whitespace-nowrap">Total runtime: <wbr /> {formatTime(totals.runtime)}</h5>
	</header>

	<div class="mx-auto mb-2 flex flex-col lg:w-[80%]">
		<input
			type="text"
			placeholder="Search UUID or username..."
			class="input"
			bind:value={search}
			oninput={async () =>
				await replaceQuery(page.url, {
					page: "1",
					search: search
				})}
		/>
	</div>

	<StatsTable data={stats} bind:pageSize={amount} {count}>
		{#each stats as entry}
			<tr>
				<th scope="row" class="text-surface-900-50-token px-4 font-medium md:whitespace-nowrap">
					{entry.username !== "" ? entry.username : "Anonymous"}
				</th>
				<td class="w-64 px-4">{formatNumber(entry.experience)}</td>
				<td class="w-64 px-4">{formatNumber(entry.gold)}</td>
				<td class="w-64 px-4">{formatNumber(entry.levels)}</td>
				<td class="w-64 px-4">{formatTime(entry.runtime)}</td>
			</tr>
		{/each}
	</StatsTable>
</main>
