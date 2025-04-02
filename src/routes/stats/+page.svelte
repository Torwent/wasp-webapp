<script lang="ts">
	import { invalidate } from "$app/navigation"
	import { page } from "$app/state"
	import { onMount } from "svelte"
	import { formatTime, formatNumber } from "$lib/utils"
	import StatsTable from "./StatsTable.svelte"
	import { replaceQuery } from "$lib/client/utils"
	import Head from "$lib/components/Head.svelte"

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
</script>

<Head title="Stats" description="WaspScripts usage stats." keywords="Stats, Scores" />

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
			placeholder="🔍Search UUID or username..."
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
		{#each stats, i}
			<tr>
				<th scope="row" class="text-surface-900-50-token px-4 font-medium md:whitespace-nowrap">
					{stats[i].username !== "" ? stats[i].username : "Anonymous"}
				</th>
				<td class="w-64 px-4">{formatNumber(stats[i].experience)}</td>
				<td class="w-64 px-4">{formatNumber(stats[i].gold)}</td>
				<td class="w-64 px-4">{formatNumber(stats[i].levels)}</td>
				<td class="w-64 px-4">{formatTime(stats[i].runtime)}</td>
			</tr>
		{/each}
	</StatsTable>
</main>
