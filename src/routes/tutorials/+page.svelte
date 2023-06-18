<script lang="ts">
	import { invalidate } from "$app/navigation"
	import { page } from "$app/stores"
	import { onMount } from "svelte"
	import { browser } from "$app/environment"
	import PostCard from "./PostCard.svelte"
	import Paginator from "$lib/components/Paginator.svelte"
	import { ArrowDownAZ, ArrowUpZA } from "lucide-svelte"
	export let data

	const pageStr = $page.url.searchParams.get("page") || "-1"
	let currentPage = Number(pageStr) < 0 || Number.isNaN(Number(pageStr)) ? 1 : Number(pageStr)

	let search = decodeURIComponent($page.url.searchParams.get("search") || "").trim()
	const ascendingStr = $page.url.searchParams.get("ascending")
	let ascending = ascendingStr ? ascendingStr.toLowerCase() === "true" : true

	const levelStr = $page.url.searchParams.get("level") || "-1"
	let level =
		Number(levelStr) < -1 || Number(levelStr) > 2 || Number.isNaN(Number(levelStr))
			? -1
			: Number(levelStr)

	const { range } = data

	let count = 0
	$: count = (data.count as number) || 0
	let loading = true

	function replaceQuery(values: Record<string, string>) {
		if (!browser) return
		for (let [k, v] of Object.entries(values)) {
			if (!!v && v !== "") $page.url.searchParams.set(encodeURIComponent(k), encodeURIComponent(v))
			else $page.url.searchParams.delete(k)
		}

		if (loading) return

		history.replaceState({}, "", $page.url)
		invalidate("tutorials:posts")
	}

	function sort() {
		search = ""
		ascending = !ascending
		replaceQuery({
			ascending: ascending ? "true" : "false"
		})
	}

	onMount(() => (loading = false))

	$: replaceQuery({ page: currentPage.toString() })
	$: replaceQuery({ page: "1", search: search })
	$: replaceQuery({ ascending: ascending.toString() })
	$: replaceQuery({ page: "1", level: level.toString() })

	const headTitle = "Tutorials - WaspScripts"
	const headDescription =
		"Guides and tutorials to bot and develop scripts for OldSchool RuneScape. Find the large collection of Simba tutorials available and unleach the power of Simba and max on osrs."
	const headKeywords =
		"OldSchool, RuneScape, OSRS, 2007, Color, Colour,  Bot, Wasp, Scripts, Simba, Tutorials, Tutorial, Guides, Guide"
	const headAuthor = "Torwent"
	const headImage =
		"https://enqlpchobniylwpsjcqc.supabase.co/storage/v1/object/public/imgs/logos/logo.png"
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
	<meta property="og:description" content={headDescription} />

	<!-- Twitter tags -->
	<meta name="twitter:card" content="summary" />
	<meta name="twitter:title" content={headTitle} />
	<meta name="twitter:description" content={headDescription} />
	<meta name="twitter:image" content={headImage} />
</svelte:head>

<main>
	<header class="text-center py-8">
		<h3>Welcome to the DevBlog.</h3>
		<p>Here you can find guides, tutorials and feature annoucements.</p>
	</header>

	<div class="py-6">
		<div class="text-center form my-6">
			<header class="py-4"><h3>Filter by level or search the a blog post:</h3></header>
			<div class="justify-center md:flex md:space-x-5 mb-2">
				<button
					class="w-full my-2 md:w-auto text-xs py-1 px-8 font-bold rounded-md bg-sky-400 dark:bg-sky-500 border-sky-600 dark:border-sky-300 text-white"
					class:border-r-8={level === 0}
					class:pr-6={level === 0}
					on:click={() => (level === 0 ? (level = -1) : (level = 0))}
				>
					Basic tutorial
				</button>
				<button
					class="w-full my-2 md:w-auto text-xs py-1 px-8 font-bold rounded-md bg-orange-400 dark:bg-orange-500 border-orange-600 dark:border-orange-300 text-white"
					class:border-r-8={level === 1}
					class:pr-6={level === 1}
					on:click={() => (level === 1 ? (level = -1) : (level = 1))}
				>
					Intermidiate tutorial
				</button>
				<button
					class="w-full my-2 md:w-auto text-xs py-1 px-8 font-bold rounded-md bg-red-400 dark:bg-red-500 border-red-600 dark:border-red-300 text-white"
					class:border-r-8={level === 2}
					class:pr-6={level === 2}
					on:click={() => (level === 2 ? (level = -1) : (level = 2))}
				>
					Advanced tutorial
				</button>
				<button on:click={sort} aria-label="Sort posts by level">
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
						type="search"
						placeholder="Search script id, name, categories, author,..."
						class="input"
						bind:value={search}
					/>
				</div>
			</div>
		</div>
		{#if data.profile && data.profile.profiles_protected.administrator}
			<a href="/tutorials/add" class="flex mx-auto">
				<button class="btn variant-filled-secondary flex mx-auto">Add Post</button>
			</a>
		{/if}
	</div>

	<div class="mx-auto max-w-2xl flex-grow">
		{#if data.posts}
			{#each data.posts as post}
				<PostCard bind:post />
			{/each}
		{/if}
	</div>

	<Paginator srcData={"tutorials:posts"} bind:currentPage {range} bind:count />
</main>
