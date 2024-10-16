<script lang="ts">
	import { page } from "$app/stores"
	import TutorialCard from "./TutorialCard.svelte"
	import Paginator from "$lib/components/Paginator.svelte"
	import { ArrowDownAZ, ArrowUpZA } from "lucide-svelte"
	import { replaceQuery } from "$lib/client/utils"
	import type { Tutorial } from "$lib/types/collection"
	export let data

	let { user, roles, tutorials, amount, count } = data
	let { searchParams } = $page.url

	$: ({ user, roles, tutorials, amount, count } = data)
	$: ({ searchParams } = $page.url)

	const pageStr = searchParams.get("page") || "-1"
	let currentPage = Number(pageStr) < 0 || Number.isNaN(Number(pageStr)) ? 1 : Number(pageStr)

	let search = decodeURIComponent(searchParams.get("search") || "").trim()
	const ascendingStr = searchParams.get("ascending")
	let ascending = ascendingStr ? ascendingStr.toLowerCase() === "true" : true

	const parsedLevel = Number(searchParams.get("level") ?? "-1")

	let level = parsedLevel > -1 && parsedLevel < 3 ? parsedLevel : -1

	const levelColors = ["sky", "orange", "red"]
	const levelNames = ["Basic", "Intermidiate", "Advanced"]

	async function sort() {
		search = ""
		ascending = !ascending
		await replaceQuery($page.url, {
			page: "1",
			search: search,
			ascending: ascending ? "true" : "false"
		})
	}

	const headTitle = "Tutorials - WaspScripts"
	const headDescription =
		"Guides and tutorials to bot and develop scripts for OldSchool RuneScape. Find the large collection of Simba tutorials available and unleach the power of Simba and max on osrs."
	const headKeywords =
		"OldSchool, RuneScape, OSRS, 2007, Color, Colour,  Bot, Wasp, Scripts, Simba, Tutorials, Tutorial, Guides, Guide"
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

<main class="flex flex-col mx-auto">
	<header class="text-center py-8">
		<h3>Welcome to the Tutorials section.</h3>
		<p>Here you can find guides and tutorials to learn how to bot!</p>
	</header>

	<div class="flex flex-col my-16 mx-auto">
		<h3 class="text-center">Useful resources</h3>

		<div class="flex flex-col lg:flex-row my-4 gap-2">
			<a href="https://torwent.github.io/SRL-T/" class="mx-auto">
				<button class="btn variant-outline-secondary">SRL-T Documentation</button>
			</a>
			<a href="https://torwent.github.io/WaspLib/" class="mx-auto">
				<button class="btn variant-outline-secondary">WaspLib Documentation</button>
			</a>

			<a href="https://api.waspscripts.com/docs" class="mx-auto">
				<button class="btn variant-outline-secondary">Stats API Documentation</button>
			</a>

			<a href="https://map.waspscripts.com" class="mx-auto">
				<button class="btn variant-outline-secondary">Interactive Map</button>
			</a>
		</div>
	</div>

	<div class="my-4">
		<div class="text-center form">
			<h3 class="my-8"><h3>Filter by level or search the a blog post:</h3></h3>
			<div class="flex flex-col md:flex-row mx-auto my-4 gap-2 justify-center">
				{#each levelNames as name, i}
					<button
						class="mx-auto md:mx-0 text-xs p-2 font-bold rounded-md text-white bg-{levelColors[
							i
						]}-500 border-{levelColors[i]}-500"
						class:border-r-8={level === i}
						class:pr-6={level === i}
						on:click={async () => {
							level = level === i ? -1 : i
							await replaceQuery($page.url, {
								page: "1",
								level: level.toString()
							})
						}}
					>
						{name} tutorial
					</button>
				{/each}
			</div>

			<div class="max-w-2xl mx-auto justify-center md:flex md:space-x-5 mb-2">
				<div class="w-full flex flex-col text-sm mb-2">
					<input
						type="text"
						placeholder="Search script id, name, categories, author,... (CURRENTLY NOT WORKING!)"
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
		<div class="my-8 grid place-items-center">
			<a
				href="https://github.com/Torwent/wasp-info/new/main/tutorials"
				class="btn variant-filled-tertiary"
			>
				Add a tutorial through GitHub!
			</a>
		</div>
	</div>

	<div class="mx-auto max-w-2xl flex-grow">
		{#each tutorials as tutorial}
			<TutorialCard bind:tutorial />
		{/each}
	</div>

	<Paginator
		bind:searchParams
		bind:pageIdx={currentPage}
		bind:amount
		bind:count
		amounts={[5, 10, 15, 20]}
	/>
</main>
