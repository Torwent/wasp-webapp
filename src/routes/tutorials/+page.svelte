<script lang="ts">
	import { invalidate } from "$app/navigation"
	import { page } from "$app/stores"
	import { onMount } from "svelte"
	import type { PageData } from "./$types"
	import { browser } from "$app/environment"
	import MetaTags from "$lib/components/MetaTags.svelte"
	import PostCard from "./PostCard.svelte"
	import Paginator from "$lib/components/Paginator.svelte"
	export let data: PageData

	const pageStr = $page.url.searchParams.get("page") || "-1"
	let currentPage = Number(pageStr) < 0 || Number.isNaN(Number(pageStr)) ? 1 : Number(pageStr)

	let search = decodeURI($page.url.searchParams.get("search") || "")
	let ascending = $page.url.searchParams.get("ascending")?.toLowerCase() === "true"

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
</script>

<svelte:head>
	<MetaTags
		title="Tutorials"
		description="Guides and tutorials to bot and develop scripts for OldSchool RuneScape. Find the large collection of Simba tutorials available and unleach the power of Simba and max on osrs."
	/>
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
				<button on:click={sort}>
					<svg
						class="stroke-primary-500"
						class:rotate-180={!ascending}
						xmlns="http://www.w3.org/2000/svg"
						width="24"
						height="24"
						viewBox="0 0 24 24"
					>
						<path stroke-width="2" d="M12 5v14m6-8l-6-6m-6 6l6-6" />
					</svg>
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