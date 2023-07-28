<script lang="ts">
	import { invalidate } from "$app/navigation"
	import { page } from "$app/stores"
	import { browser } from "$app/environment"
	import { onMount } from "svelte"
	import type { Stats } from "$lib/types/collection"
	import { convertTime, formatRSNumber } from "$lib/utils"
	import Paginator from "$lib/components/Paginator.svelte"

	export let data

	const pageStr = $page.url.searchParams.get("page") || "-1"
	let currentPage = Number(pageStr) < 0 || Number.isNaN(Number(pageStr)) ? 1 : Number(pageStr)

	let search = decodeURIComponent($page.url.searchParams.get("search") || "").trim()
	let ascending = $page.url.searchParams.get("ascending")?.toLowerCase() === "true"
	let headers: (keyof Stats)[] = ["username", "experience", "gold", "levels", "runtime"]
	let selectedHeader: keyof Stats =
		($page.url.searchParams.get("order") as keyof Stats) || "experience"
	let loading = true

	function replaceQuery(values: Record<string, string>) {
		if (!browser) return
		for (let [k, v] of Object.entries(values)) {
			if (!!v && v !== "") $page.url.searchParams.set(encodeURIComponent(k), encodeURIComponent(v))
			else $page.url.searchParams.delete(k)
		}

		if (loading) return

		history.replaceState({}, "", $page.url)
		invalidate("supabase:stats")
	}

	function sortBy(header: keyof Stats) {
		search = ""
		ascending = selectedHeader === header ? !ascending : false
		selectedHeader = header
		replaceQuery({
			ascending: ascending ? "true" : "false",
			order: header
		})
	}

	const { range, supabaseClient } = data

	let { count } = data.stats
	$: ({ count } = data.stats)

	onMount(() => {
		loading = false
		const subscription = supabaseClient
			.channel("stats-changed")
			.on(
				"postgres_changes",
				{
					event: "UPDATE",
					schema: "public",
					table: "stats_scripts"
				},
				() => invalidate("supabase:stats")
			)
			.subscribe()

		return () => subscription.unsubscribe()
	})

	$: if (browser) replaceQuery({ search: search })

	$: replaceQuery({ page: currentPage.toString() })
	$: replaceQuery({ page: "1", search: search })
	$: replaceQuery({ ascending: ascending.toString() })

	const headTitle = "Stats - WaspScripts"
	const headDescription = "WaspScripts usage stats."
	const headKeywords =
		"OldSchool, RuneScape, OSRS, 2007, Color, Colour,  Bot, Wasp, Scripts, Simba, Stats"
	const headAuthor = "Torwent"
	const headImage =
		"https://enqlpchobniylwpsjcqc.supabase.co/storage/v1/object/public/imgs/logos/multi-color-logo.png"
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

<main class="overflow-x-auto relative shadow-md sm:rounded-lg my-4 mx-12 md:mx-16 lg:mx-24">
	<header class="">
		<h5 class="py-4 px-6 font-bold text-center whitespace-nowrap">
			Total experience:
			<span class="py-4 pr-6">
				{formatRSNumber(data.total.experience || 0)}
			</span>
			<wbr />
			Total gold:
			<span class="py-4 pr-6">
				{formatRSNumber(data.total.gold || 0)}
			</span>
			<wbr />
			Total levels:
			<span class="py-4 pr-6">{data.total.levels}</span>
			<wbr />
			Total runtime:
			<span class="py-4 pr-6">
				{convertTime(data.total.runtime || 0)}
			</span>
		</h5>
	</header>

	<div class="mx-auto lg:w-[80%] flex flex-col mb-2">
		<input type="text" placeholder="Search UUID or username..." class="input" bind:value={search} />
	</div>

	<table class="w-full text-sm text-left text-stone-500 dark:text-stone-400">
		<thead class="text-xs text-secondary-500 uppercase bg-stone-50 dark:bg-stone-700">
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
			{#each data.stats.stats as entry}
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
						{formatRSNumber(entry.experience || 0)}
					</td>
					<td class="py-4 px-6 w-64">
						{formatRSNumber(entry.gold || 0)}
					</td>
					<td class="py-4 px-6 w-64">{entry.levels}</td>
					<td class="py-4 px-6 w-64">
						{convertTime(entry.runtime || 0)}
					</td>
				</tr>
			{/each}
		</tbody>
	</table>

	<Paginator srcData={"supabase:stats"} bind:currentPage {range} bind:count />
</main>
