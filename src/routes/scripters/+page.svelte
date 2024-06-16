<script lang="ts">
	import { page } from "$app/stores"
	import ScripterCard from "./ScripterCard.svelte"
	import Paginator from "$lib/components/Paginator.svelte"
	import type { ScripterBase } from "$lib/types/collection"
	import { replaceQuery } from "$lib/client/utils"

	export let data

	let { scriptersPromise, range } = data
	let { searchParams } = $page.url

	$: ({ scriptersPromise, range } = data)
	$: ({ searchParams } = $page.url)

	const pageStr = searchParams.get("page") || "-1"
	let currentPage = Number(pageStr) < 0 || Number.isNaN(Number(pageStr)) ? 1 : Number(pageStr)

	let search: string

	let scripters: ScripterBase[] | null = null
	let count: number = 0

	$: scriptersPromise.then((awaited) => {
		scripters = awaited.scripters
		count = awaited.count
	})

	const headTitle = "Scripters - WaspScripts"
	const headDescription =
		"List of scripters and developers that are behind the project directly and/or indirerectly."
	const headKeywords =
		"OldSchool, RuneScape, OSRS, 2007, Color, Colour,  Bot, Wasp, Scripts, Simba, Scripters, Developers"
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
						on:input={async () =>
							await replaceQuery($page.url, {
								page: "1",
								search: search
							})}
					/>
				</div>
			</div>
		</div>
	</div>

	{#if scripters}
		<div class="mx-auto max-w-2xl flex-grow">
			{#each scripters as scripter}
				<ScripterCard bind:scripter />
			{/each}
		</div>
	{:else}
		<div class="mx-auto max-w-2xl flex-grow">
			{#each Array(11) as _}
				<ScripterCard />
			{/each}
		</div>
	{/if}

	<Paginator {searchParams} pageIdx={currentPage} {range} bind:count />
</main>
