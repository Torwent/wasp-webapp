<script lang="ts">
	import { invalidate } from "$app/navigation"
	import { page } from "$app/stores"
	import { onMount } from "svelte"
	import { browser } from "$app/environment"
	import DevCard from "./DevCard.svelte"
	import Paginator from "$lib/components/Paginator.svelte"
	export let data

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
		invalidate("supabase:developers")
	}

	let { range, developers } = data
	let count = 0

	$: ({ range, developers } = data)
	$: count = (data.count as number) || 0

	onMount(() => replaceQuery({ search: search }))

	$: if (browser) replaceQuery({ page: currentPage.toString() })
	$: if (browser) replaceQuery({ search: search })

	const headTitle = "Developers - WaspScripts"
	const headDescription =
		"List of developers that are behind the project directly and/or indirerectly."
	const headKeywords =
		"OldSchool, RuneScape, OSRS, 2007, Color, Colour,  Bot, Wasp, Scripts, Simba, Developers"
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

<main>
	<header class="text-center py-8">
		<h3>Welcome to the Developers section.</h3>
		<p>
			Here you can find information about the developers involved directly or indirectly with
			WaspScripts.
		</p>
	</header>

	<div class="py-6">
		<div class="text-center form my-6">
			<header class="py-4"><h4>Search:</h4></header>
			<div class="max-w-2xl mx-auto justify-center md:flex md:space-x-5 mb-2">
				<div class="w-full flex flex-col text-sm mb-2">
					<input
						type="text"
						placeholder="Search username, name, info, ..."
						class="input"
						bind:value={search}
					/>
				</div>
			</div>
		</div>
	</div>

	<div class="mx-auto max-w-2xl flex-grow">
		{#each developers as developer}
			<DevCard bind:developer />
		{/each}
	</div>

	<Paginator srcData={"supabase:developers"} bind:currentPage {range} bind:count />
</main>
