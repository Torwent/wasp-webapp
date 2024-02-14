<script lang="ts">
	import { goto, invalidate } from "$app/navigation"
	import { page } from "$app/stores"
	import { browser } from "$app/environment"
	import { onMount } from "svelte"
	import type { Stats } from "$lib/types/collection"
	import { convertTime, formatRSNumber } from "$lib/utils"
	import Paginator from "$lib/components/Paginator.svelte"
	import { ChevronDown, ChevronUp } from "lucide-svelte"

	export let data

	let {
		supabaseClient,
		stats: { count },
		range
	} = data

	let { searchParams } = $page.url
	$: ({ searchParams } = $page.url)
	$: ({
		supabaseClient,
		stats: { count },
		range
	} = data)

	const pageStr = searchParams.get("page") || "-1"
	let currentPage = Number(pageStr) < 0 || Number.isNaN(Number(pageStr)) ? 1 : Number(pageStr)

	let search = decodeURIComponent(searchParams.get("search") || "").trim()
	let ascending = searchParams.get("ascending")?.toLowerCase() === "true"
	let headers: (keyof Stats)[] = ["username", "experience", "gold", "levels", "runtime"]
	let selectedHeader: keyof Stats = (searchParams.get("order") as keyof Stats) || "experience"

	async function replaceQuery(values: Record<string, string>) {
		if (!browser) return
		let invalidate: boolean = false
		for (let [k, v] of Object.entries(values)) {
			if (!!v && v !== "") searchParams.set(encodeURIComponent(k), encodeURIComponent(v))
			else searchParams.delete(k)

			invalidate = invalidate || v === ""
		}

		const path = $page.url.origin + $page.url.pathname + "?" + searchParams.toString()

		await goto(path, {
			keepFocus: true,
			noScroll: true,
			replaceState: true,
			invalidateAll: invalidate
		})
	}

	async function sortBy(header: keyof Stats) {
		search = ""
		ascending = selectedHeader === header ? !ascending : false
		selectedHeader = header
		await replaceQuery({
			ascending: ascending ? "true" : "false",
			order: header
		})
	}

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
	const headImage =
		"https://db.waspscripts.com/storage/v1/object/public/imgs/logos/multi-color-logo.png"
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
			<span class="py-4 pr-6">{formatRSNumber(data.total.levels)}</span>
			<wbr />
			Total runtime:
			<span class="py-4 pr-6">
				{convertTime(data.total.runtime || 0)}
			</span>
		</h5>
	</header>

	<div class="mx-auto lg:w-[80%] flex flex-col mb-2">
		<input
			type="text"
			placeholder="Search UUID or username..."
			class="input"
			bind:value={search}
			on:input={async () => await replaceQuery({ page: "1", search: search })}
		/>
	</div>

	<table class="w-full text-sm text-left table table-hover">
		<thead class="text-xs uppercase text-primary-700 dark:text-primary-500">
			<tr>
				{#each headers as header}
					<th scope="col" class="py-3 px-6" on:click={async () => await sortBy(header)}>
						<div class="flex justify-between text-sm">
							<span class="align-middle h-full my-auto">
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
								{#if ascending} <ChevronDown /> {:else} <ChevronUp /> {/if}
							{/if}
						</div>
					</th>
				{/each}
			</tr>
		</thead>
		<tbody>
			{#each data.stats.stats as entry}
				<tr>
					<th
						scope="row"
						class="py-4 px-6 font-medium text-stone-900 whitespace-nowrap dark:text-white w-96"
					>
						{entry.username !== "" ? entry.username : "Anonymous"}
					</th>
					<td class="py-4 px-6 w-64">{formatRSNumber(entry.experience ?? 0)}</td>
					<td class="py-4 px-6 w-64">{formatRSNumber(entry.gold ?? 0)}</td>
					<td class="py-4 px-6 w-64">{formatRSNumber(entry.levels)}</td>
					<td class="py-4 px-6 w-64">{convertTime(entry.runtime ?? 0)}</td>
				</tr>
			{/each}
		</tbody>
	</table>

	<Paginator bind:searchParams bind:pageIdx={currentPage} {range} bind:count />
</main>
