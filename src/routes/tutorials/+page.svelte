<script lang="ts">
	import { goto } from "$app/navigation"
	import { page } from "$app/stores"
	import { browser } from "$app/environment"
	import TutorialCard from "./TutorialCard.svelte"
	import Paginator from "$lib/components/Paginator.svelte"
	import { ArrowDownAZ, ArrowUpZA } from "lucide-svelte"
	export let data

	let { range, tutorials } = data
	let { count } = tutorials
	let { searchParams } = $page.url

	$: ({ tutorials, range } = data)
	$: ({ count } = tutorials)
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

	async function replaceQuery(values: Record<string, string>) {
		if (!browser) return

		for (let [k, v] of Object.entries(values)) {
			if (!!v && v !== "") searchParams.set(encodeURIComponent(k), encodeURIComponent(v))
			else searchParams.delete(k)
		}

		const path = $page.url.origin + $page.url.pathname + "?" + searchParams.toString()

		await goto(path, {
			keepFocus: true,
			noScroll: true,
			replaceState: true,
			invalidateAll: true
		})
	}

	async function sort() {
		search = ""
		ascending = !ascending
		await replaceQuery({ page: "1", search: search, ascending: ascending ? "true" : "false" })
	}

	const headTitle = "Tutorials - WaspScripts"
	const headDescription =
		"Guides and tutorials to bot and develop scripts for OldSchool RuneScape. Find the large collection of Simba tutorials available and unleach the power of Simba and max on osrs."
	const headKeywords =
		"OldSchool, RuneScape, OSRS, 2007, Color, Colour,  Bot, Wasp, Scripts, Simba, Tutorials, Tutorial, Guides, Guide"
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

<main>
	<header class="text-center py-8">
		<h3>Welcome to the Tutorials section.</h3>
		<p>Here you can find guides and tutorials to learn how to bot!</p>
	</header>

	<div class="py-6">
		<div class="text-center form my-6">
			<header class="py-4"><h3>Filter by level or search the a blog post:</h3></header>
			<div class="justify-center md:flex md:space-x-5 mb-2">
				{#each levelNames as name, i}
					<button
						class="w-full my-2 md:w-auto text-xs py-1 px-8 font-bold rounded-md text-white
							   bg-{levelColors[i]}-500 border-{levelColors[i]}-500"
						class:border-r-8={level === i}
						class:pr-6={level === i}
						on:click={async () => {
							level = level === i ? -1 : i
							await replaceQuery({ page: "1", level: level.toString() })
						}}
					>
						{name} tutorial
					</button>
				{/each}

				<button on:click={async () => await sort()} aria-label="Sort posts by level">
					{#if ascending}
						<ArrowDownAZ />
					{:else}
						<ArrowUpZA />
					{/if}
				</button>
			</div>
			<div class="max-w-2xl mx-auto justify-center md:flex md:space-x-5 mb-2">
				<div class="w-full flex flex-col text-sm mb-2">
					<input
						type="text"
						placeholder="Search script id, name, categories, author,..."
						class="input"
						bind:value={search}
						on:input={async () => await replaceQuery({ page: "1", search: search })}
					/>
				</div>
			</div>
		</div>
		{#if data.profile && data.profile.roles.administrator}
			<a href="/tutorials/add" class="flex mx-auto">
				<button class="btn variant-filled-secondary flex mx-auto">Add Post</button>
			</a>
		{/if}
	</div>

	<div class="mx-auto max-w-2xl flex-grow">
		{#each tutorials.data as tutorial}
			<TutorialCard bind:tutorial />
		{/each}
	</div>

	<Paginator bind:searchParams bind:pageIdx={currentPage} {range} bind:count />
</main>
